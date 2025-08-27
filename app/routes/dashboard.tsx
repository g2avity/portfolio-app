import type { LoaderFunctionArgs } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { Plus, Edit, Eye, X } from "lucide-react";

import { requireUser } from "../lib/session.server";
import { ErrorBoundary as AppErrorBoundary } from "../components/error-boundary";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { ExperienceForm } from "../components/experience-form";
import { SkillsForm } from "../components/skills-form";
import { CustomSectionForm } from "../components/custom-section-form";
import { CustomSectionDisplay } from "../components/custom-section-display";
import { EntryForm } from "../components/entry-form";
import { ProfileForm } from "../components/profile-form";
import { getUserExperiences, getUserExperienceCount, createExperience, updateExperience, deleteExperience, getUserSkills, getUserSkillCount, createSkill, updateSkill, deleteSkill, updateUserProfile, getUserCustomSections, getUserCustomSectionCount, createCustomSection, updateCustomSection, deleteCustomSection } from "../lib/db.server";
import { testBlobConnection } from "../lib/blob.server";
import { redirect } from "react-router";
import { RichTextDisplay } from "../components/rich-text-display";
import { ConfirmationModal } from "../components/confirmation-modal";

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <AppErrorBoundary 
      error={error} 
      title="Dashboard Error"
      showBackButton={true}
      showHomeButton={true}
    />
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  // Fetch real portfolio stats from database
  const [experiences, experienceCount, skills, skillsCount, customSections, customSectionsCount] = await Promise.all([
    getUserExperiences(user.id),
    getUserExperienceCount(user.id),
    getUserSkills(user.id),
    getUserSkillCount(user.id),
    getUserCustomSections(user.id),
    getUserCustomSectionCount(user.id),
  ]);
  
  const portfolioStats = {
    experiences: experienceCount,
    skills: skillsCount,
    customSections: customSectionsCount
  };
  
  // Debug: Log user data to see if avatarUrl is present
  console.log("🔍 Loader - User data:", {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    avatarUrl: user.avatarUrl,
    hasAvatar: !!user.avatarUrl
  });
  
  // Test blob connection
  try {
    await testBlobConnection();
  } catch (error) {
    console.error("❌ Blob connection test failed:", error);
  }
  
  return { user, portfolioStats, experiences, skills, customSections };
}

export async function action({ request }: LoaderFunctionArgs) {
  console.log("🚀 Action function entry point");
  
  const user = await requireUser(request);
  console.log("👤 User authenticated:", { userId: user.id, email: user.email });
  
  const formData = await request.formData();
  const action = formData.get("_action");
  
  console.log("📋 Form data received:", {
    action,
    hasFirstName: formData.has("firstName"),
    hasLastName: formData.has("lastName"),
    hasAvatar: formData.has("avatar"),
    formDataKeys: Array.from(formData.keys())
  });
  
  if (action === "createExperience") {
    const title = formData.get("title") as string;
    const companyName = formData.get("companyName") as string;
    const description = formData.get("description") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;
    const isCurrent = formData.get("isCurrent") === "on";
    const location = formData.get("location") as string;
    
    if (!title || !companyName || !description || !startDate) {
      return { 
        success: false, 
        error: "Missing experience fields",
        details: "Title, company name, description, and start date are required"
      };
    }
    
    try {
      const experience = await createExperience({
        title,
        companyName,
        description,
        startDate,
        endDate,
        isCurrent,
        location,
        userId: user.id,
      });
      
      return { 
        success: true, 
        type: "experience-created",
        title,
        company: companyName
      };
    } catch (error) {
      console.error("Failed to create experience:", error);
      return { 
        success: false, 
        error: "Failed to create experience",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "updateExperience") {
    const experienceId = formData.get("experienceId") as string;
    const title = formData.get("title") as string;
    const companyName = formData.get("companyName") as string;
    const description = formData.get("description") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = formData.get("endDate") ? new Date(formData.get("endDate") as string) : undefined;
    const isCurrent = formData.get("isCurrent") === "on";
    const location = formData.get("location") as string;
    
    if (!experienceId || !title || !companyName || !description || !startDate) {
      return { 
        success: false, 
        error: "Missing experience fields",
        details: "Experience ID, title, company name, description, and start date are required"
      };
    }
    
    try {
      await updateExperience({
        id: experienceId,
        title,
        companyName,
        description,
        startDate,
        endDate,
        isCurrent,
        location,
        userId: user.id,
      });
      
      return { 
        success: true, 
        type: "experience-updated",
        title,
        company: companyName
      };
    } catch (error) {
      console.error("Failed to update experience:", error);
      return { 
        success: false, 
        error: "Failed to update experience",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "deleteExperience") {
    const experienceId = formData.get("experienceId") as string;
    const title = formData.get("title") as string;
    const companyName = formData.get("companyName") as string;
    
    if (!experienceId) {
      return { 
        success: false, 
        error: "Missing experience ID",
        details: "Experience ID is required for deletion"
      };
    }
    
    try {
      await deleteExperience(experienceId, user.id);
      
      return { 
        success: true, 
        type: "experience-deleted",
        title: title || 'Experience',
        company: companyName || 'Unknown Company'
      };
    } catch (error) {
      console.error("Failed to delete experience:", error);
      return { 
        success: false, 
        error: "Failed to delete experience",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "createSkill") {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const proficiency = formData.get("proficiency") ? parseInt(formData.get("proficiency") as string) : undefined;
    const yearsOfExperience = formData.get("yearsOfExperience") ? parseInt(formData.get("yearsOfExperience") as string) : undefined;
    
    console.log("🔍 Skill form data received:", {
      name: name || "EMPTY",
      description: description || "EMPTY", 
      category: category || "EMPTY",
      proficiency,
      yearsOfExperience
    });
    
    if (!name || !description) {
      console.log("❌ Missing required skill fields");
      return { 
        success: false, 
        error: "Missing skill fields",
        details: "Name and description are required"
      };
    }
    
    try {
      const skill = await createSkill({
        name,
        description,
        category,
        proficiency,
        yearsOfExperience,
        userId: user.id,
      });
      
      return { 
        success: true, 
        type: "skill-created",
        title: name,
        company: "Skill"
      };
    } catch (error) {
      console.error("Failed to create skill:", error);
      return { 
        success: false, 
        error: "Failed to create skill",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "updateSkill") {
    const skillId = formData.get("skillId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const proficiency = formData.get("proficiency") ? parseInt(formData.get("proficiency") as string) : undefined;
    const yearsOfExperience = formData.get("yearsOfExperience") ? parseInt(formData.get("yearsOfExperience") as string) : undefined;
    
    if (!skillId || !name || !description) {
      return { 
        success: false, 
        error: "Missing skill fields",
        details: "Skill ID, name, and description are required"
      };
    }
    
    try {
      await updateSkill({
        id: skillId,
        name,
        description,
        category,
        proficiency,
        yearsOfExperience,
        userId: user.id,
      });
      
      return { 
        success: true, 
        type: "skill-updated",
        title: name,
        company: "Skill"
      };
    } catch (error) {
      console.error("Failed to update skill:", error);
      return { 
        success: false, 
        error: "Failed to update skill",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "deleteSkill") {
    const skillId = formData.get("skillId") as string;
    const name = formData.get("name") as string;
    
    if (!skillId) {
      return { 
        success: false, 
        error: "Missing skill ID",
        details: "Skill ID is required for deletion"
      };
    }
    
    try {
      await deleteSkill(skillId, user.id);
      
      return { 
        success: true, 
        type: "skill-deleted",
        title: name || 'Skill',
        company: "Skill"
      };
    } catch (error) {
      console.error("Failed to delete skill:", error);
      return { 
        success: false, 
        error: "Failed to delete skill",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "updateProfile") {
    console.log("🚀 Profile update action triggered");
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const bio = formData.get("bio") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const country = formData.get("country") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const websiteUrl = formData.get("websiteUrl") as string;
    const avatar = formData.get("avatar") as File;
    
    console.log("📝 Form data received:", {
      firstName, lastName, bio, phone, address, city, state, country,
      linkedinUrl, githubUrl, websiteUrl,
      hasAvatar: !!avatar, avatarSize: avatar?.size, avatarName: avatar?.name
    });
    
    console.log("🔍 Avatar object details:", {
      avatar: avatar,
      type: typeof avatar,
      constructor: avatar?.constructor?.name,
      isFile: avatar instanceof File,
      hasSize: avatar && 'size' in avatar,
      hasName: avatar && 'name' in avatar,
      size: avatar?.size,
      name: avatar?.name
    });
    
    if (!firstName || !lastName) {
      console.log("❌ Missing required fields");
      return { 
        success: false, 
        error: "Missing required fields",
        details: "First name and last name are required"
      };
    }
    
    try {
      let avatarUrl = user.avatarUrl;
      
      // Handle avatar upload if provided
      if (avatar && avatar.size > 0) {
        try {
          console.log("📤 Starting avatar upload...", { fileName: avatar.name, size: avatar.size });
          
          // Import and use blob upload
          const { uploadUserAvatar } = await import("../lib/blob.server");
          const result = await uploadUserAvatar(avatar, user.id);
          avatarUrl = result.url;
          
          console.log("✅ Avatar upload successful:", { url: avatarUrl });
        } catch (error) {
          console.error("❌ Failed to upload avatar:", error);
          return { 
            success: false, 
            error: "Failed to upload avatar",
            details: error instanceof Error ? error.message : "Unknown error"
          };
        }
      } else {
        console.log("ℹ️ No avatar file provided, keeping existing:", user.avatarUrl);
      }
      
      // Always update profile data (with or without avatar)
      console.log("💾 Updating profile with avatarUrl:", avatarUrl);
      
      await updateUserProfile(user.id, {
        firstName,
        lastName,
        bio: bio || undefined,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        country: country || undefined,
        linkedinUrl: linkedinUrl || undefined,
        githubUrl: githubUrl || undefined,
        websiteUrl: websiteUrl || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      
      // Return success response instead of redirecting
      if (avatar && avatar.size > 0) {
        console.log("✅ Profile updated with avatar");
        return { 
          success: true, 
          message: "Profile updated successfully",
          type: "avatar-uploaded",
          name: firstName
        };
      } else {
        console.log("✅ Profile updated without avatar");
        return { 
          success: true, 
          message: "Profile updated successfully",
          type: "profile-updated",
          name: firstName
        };
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      return { 
        success: false, 
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "createCustomSection") {
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    if (!type || !title) {
      return { 
        success: false, 
        error: "Missing custom section fields",
        details: "Type and title are required"
      };
    }
    
    try {
      // Import the helper function
      const { createSectionFromTemplate } = await import("../lib/content-section-models");
      const sectionData = createSectionFromTemplate(type, user.id, title, description);
      
      const customSection = await createCustomSection(sectionData);
      
      return { 
        success: true, 
        type: "custom-section-created",
        title: customSection.title,
        sectionType: customSection.type
      };
    } catch (error) {
      console.error("Failed to create custom section:", error);
      return { 
        success: false, 
        error: "Failed to create custom section",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "updateCustomSection") {
    const sectionId = formData.get("sectionId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isPublic = formData.get("isPublic") === "on";
    
    if (!sectionId || !title) {
      return { 
        success: false, 
        error: "Missing custom section fields",
        details: "Section ID and title are required"
      };
    }
    
    try {
      await updateCustomSection(sectionId, user.id, {
        title,
        description: description || undefined,
        isPublic,
      });
      
      return { 
        success: true, 
        type: "custom-section-updated",
        title,
        sectionType: "Custom Section"
      };
    } catch (error) {
      console.error("Failed to update custom section:", error);
      return { 
        success: false, 
        error: "Failed to update custom section",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  if (action === "deleteCustomSection") {
    const sectionId = formData.get("sectionId") as string;
    const title = formData.get("title") as string;
    
    if (!sectionId) {
      return { 
        success: false, 
        error: "Missing section ID",
        details: "Section ID is required for deletion"
      };
    }
    
    try {
      await deleteCustomSection(sectionId, user.id);
      
      return { 
        success: true, 
        type: "custom-section-deleted",
        title: title || 'Custom Section',
        sectionType: "Custom Section"
      };
    } catch (error) {
      console.error("Failed to delete custom section:", error);
      return { 
        success: false, 
        error: "Failed to delete custom section",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  // Entry management actions
  if (action === "addEntryToCustomSection") {
    const sectionId = formData.get("sectionId") as string;
    const entryData = JSON.parse(formData.get("entryData") as string);
    
    if (!sectionId || !entryData) {
      return { 
        success: false, 
        error: "Missing entry data",
        details: "Section ID and entry data are required"
      };
    }
    
    try {
      // Import the helper function
      const { addEntryToSection } = await import("../lib/content-section-models");
      
      // Get the current section
      const currentSection = await getUserCustomSections(user.id);
      const section = currentSection.find(s => s.id === sectionId);
      
      if (!section) {
        return { 
          success: false, 
          error: "Section not found",
          details: "The specified section does not exist"
        };
      }
      
      // Add entry to section content
      const updatedContent = addEntryToSection(section.content, entryData);
      
      // Update the section with new content
      await updateCustomSection(sectionId, user.id, {
        content: updatedContent,
      });
      
      return { 
        success: true, 
        type: "entry-added",
        title: entryData.title || 'Entry',
        sectionType: "Entry"
      };
    } catch (error) {
      console.error("Failed to add entry:", error);
      return { 
        success: false, 
        error: "Failed to add entry",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  if (action === "updateEntryInCustomSection") {
    const sectionId = formData.get("sectionId") as string;
    const entryId = formData.get("entryId") as string;
    const entryData = JSON.parse(formData.get("entryData") as string);
    
    if (!sectionId || !entryId || !entryData) {
      return { 
        success: false, 
        error: "Missing entry data",
        details: "Section ID, entry ID, and entry data are required"
      };
    }
    
    try {
      // Import the helper function
      const { updateEntryInSection } = await import("../lib/content-section-models");
      
      // Get the current section
      const currentSection = await getUserCustomSections(user.id);
      const section = currentSection.find(s => s.id === sectionId);
      
      if (!section) {
        return { 
          success: false, 
          error: "Section not found",
          details: "The specified section does not exist"
        };
      }
      
      // Update entry in section content
      const updatedContent = updateEntryInSection(section.content, entryId, entryData);
      
      // Update the section with new content
      await updateCustomSection(sectionId, user.id, {
        content: updatedContent,
      });
      
      return { 
        success: true, 
        type: "entry-updated",
        title: entryData.title || 'Entry',
        sectionType: "Entry"
      };
    } catch (error) {
      console.error("Failed to update entry:", error);
      return { 
        success: false, 
        error: "Failed to update entry",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  if (action === "deleteEntryFromCustomSection") {
    const sectionId = formData.get("sectionId") as string;
    const entryId = formData.get("entryId") as string;
    
    if (!sectionId || !entryId) {
      return { 
        success: false, 
        error: "Missing entry data",
        details: "Section ID and entry ID are required"
      };
    }
    
    try {
      // Import the helper function
      const { removeEntryFromSection } = await import("../lib/content-section-models");
      
      // Get the current section
      const currentSection = await getUserCustomSections(user.id);
      const section = currentSection.find(s => s.id === sectionId);
      
      if (!section) {
        return { 
          success: false, 
          error: "Section not found",
          details: "The specified section does not exist"
        };
      }
      
      // Remove entry from section content
      const updatedContent = removeEntryFromSection(section.content, entryId);
      
      // Update the section with new content
      await updateCustomSection(sectionId, user.id, {
        content: updatedContent,
      });
      
      return { 
        success: true, 
        type: "entry-deleted",
        title: 'Entry',
        sectionType: "Entry"
      };
    } catch (error) {
      console.error("Failed to delete entry:", error);
      return { 
        success: false, 
        error: "Failed to delete entry",
        details: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  
  console.log("❌ No matching action found for:", action);
  throw new Response("Invalid action", { status: 400 });
}

import { useLoaderData, useSubmit, useActionData } from "react-router";
import { useState, useEffect } from "react";
import { experienceToasts, profileToasts, skillToasts } from "../lib/toast.client";

export default function Dashboard() {
  const { user, portfolioStats, experiences, skills, customSections } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  
  // Form state management
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [showCustomSectionForm, setShowCustomSectionForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  
  // Edit and delete state
  const [editingExperience, setEditingExperience] = useState<typeof experiences[0] | null>(null);
  const [deletingExperience, setDeletingExperience] = useState<typeof experiences[0] | null>(null);
  const [editingSkill, setEditingSkill] = useState<typeof skills[0] | null>(null);
  const [deletingSkill, setDeletingSkill] = useState<typeof skills[0] | null>(null);
  const [editingCustomSection, setEditingCustomSection] = useState<typeof customSections[0] | null>(null);
  const [deletingCustomSection, setDeletingCustomSection] = useState<typeof customSections[0] | null>(null);

  // Entry management state
  const [editingEntry, setEditingEntry] = useState<{ sectionId: string; entryId: string; entry: any } | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<{ sectionId: string; entryId: string; entry: any } | null>(null);

  // Old URL-based useEffect removed - now using direct state management

  // Entry management handlers
  const handleAddEntry = (sectionId: string) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      setEditingEntry({ sectionId, entryId: '', entry: null });
      setShowEntryForm(true);
    }
  };

  const handleEditEntry = (sectionId: string, entryId: string) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      const entry = section.content?.entries?.find((e: any) => e.id === entryId);
      if (entry) {
        setEditingEntry({ sectionId, entryId, entry });
        setShowEntryForm(true);
      }
    }
  };

  const handleDeleteEntry = (sectionId: string, entryId: string) => {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
      const entry = section.content?.entries?.find((e: any) => e.id === entryId);
      if (entry) {
        setDeletingEntry({ sectionId, entryId, entry });
      }
    }
  };

  const handleEntrySubmit = (entryData: any) => {
    const formData = new FormData();
    
    if (editingEntry?.entryId) {
      // Update existing entry
      formData.append("_action", "updateEntryInCustomSection");
      formData.append("sectionId", editingEntry.sectionId);
      formData.append("entryId", editingEntry.entryId);
    } else {
      // Add new entry
      formData.append("_action", "addEntryToCustomSection");
      formData.append("sectionId", editingEntry!.sectionId);
    }
    
    formData.append("entryData", JSON.stringify(entryData));
    submit(formData, { method: "post" });
  };

  // Handle action responses (success/error) and close modals
  useEffect(() => {
    if (actionData) {
      console.log("🎯 Action response received:", actionData);
      
      if (actionData.success) {
        // Close appropriate modal based on action type
        if (actionData.type === "profile-updated" || actionData.type === "avatar-uploaded") {
          setShowProfileForm(false);
          
          // Show appropriate toast
          if (actionData.type === "avatar-uploaded") {
            profileToasts.avatarUploaded();
          } else {
            profileToasts.updated();
          }
        } else if (actionData.type?.includes("experience")) {
          setShowExperienceForm(false);
          setEditingExperience(null);
          
          // Show appropriate toast
          if (actionData.type === "experience-created") {
            experienceToasts.created(actionData.title || "Experience", actionData.company || "Company");
          } else if (actionData.type === "experience-updated") {
            experienceToasts.updated(actionData.title || "Experience", actionData.company || "Company");
          } else if (actionData.type === "experience-deleted") {
            experienceToasts.deleted(actionData.title || "Experience", actionData.company || "Company");
          }
        } else if (actionData.type?.includes("skill")) {
          setShowSkillsForm(false);
          setEditingSkill(null);
          
          // Show appropriate toast
          if (actionData.type === "skill-created") {
            skillToasts.created(actionData.title || "Skill");
          } else if (actionData.type === "skill-updated") {
            skillToasts.updated(actionData.title || "Skill");
          } else if (actionData.type === "skill-deleted") {
            skillToasts.deleted(actionData.title || "Skill");
          }
        } else if (actionData.type?.includes("custom-section")) {
          setShowCustomSectionForm(false);
          
          // Show appropriate toast
          if (actionData.type === "custom-section-created") {
            // TODO: Add custom section toasts
            console.log("Custom section created:", actionData.title);
          } else if (actionData.type === "custom-section-updated") {
            console.log("Custom section updated:", actionData.title);
          } else if (actionData.type === "custom-section-deleted") {
            console.log("Custom section deleted:", actionData.title);
          }
        } else if (actionData.type?.includes("entry")) {
          // Reset entry editing state
          setEditingEntry(null);
          setDeletingEntry(null);
          setShowEntryForm(false);
          
          // Show appropriate toast
          if (actionData.type === "entry-added") {
            // TODO: Add entry toasts
            console.log("Entry added:", actionData.title);
          } else if (actionData.type === "entry-updated") {
            console.log("Entry updated:", actionData.title);
          } else if (actionData.type === "entry-deleted") {
            console.log("Entry deleted:", actionData.title);
          }
        }
        
        // Trigger data refresh by reloading the page for all successful actions
        window.location.reload();
      } else {
        // Handle errors
        console.error("❌ Action failed:", actionData);
        console.log("🔍 Error details:", {
          error: actionData.error,
          includesSkill: actionData.error?.includes("skill"),
          includesExperience: actionData.error?.includes("experience"),
          includesAvatar: actionData.error?.includes("avatar")
        });
        
        // Show appropriate error toast based on error message
        if (actionData.error?.includes("avatar")) {
          profileToasts.avatarUploadError();
        } else if (actionData.error?.includes("experience")) {
          experienceToasts.createError();
        } else if (actionData.error?.includes("skill")) {
          skillToasts.createError();
        } else {
          console.log("⚠️ Falling back to profile error toast");
          profileToasts.updateError();
        }
        
        // Close modal on error too - this gives immediate feedback
        if (actionData.error?.includes("skill")) {
          console.log("🔒 Closing skills modal on error");
          setShowSkillsForm(false);
          setEditingSkill(null);
        } else if (actionData.error?.includes("experience")) {
          console.log("🔒 Closing experience modal on error");
          setShowExperienceForm(false);
          setEditingExperience(null);
        } else if (actionData.error?.includes("profile")) {
          console.log("🔒 Closing profile modal on error");
          setShowProfileForm(false);
        }
      }
    }
  }, [actionData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}'s Portfolio Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your professional portfolio and content</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="layout-original">
          {/* Main Content Area - Vertically Aligned Cards */}
          <div className="main-content-area space-y-8">
            {/* Profile Information Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowProfileForm(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <>
                        <img 
                          src={user.avatarUrl} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log("❌ Image failed to load:", user.avatarUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => console.log("✅ Image loaded successfully:", user.avatarUrl)}
                        />
                        {/* Debug info */}
                        <div className="hidden">
                          Avatar URL: {user.avatarUrl}
                        </div>
                      </>
                    ) : (
                      <span className="text-2xl font-medium text-gray-600">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{user.firstName} {user.lastName}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    {user.bio && (
                      <p className="text-gray-700 mt-2">{user.bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900">
                      {user.city && user.state ? `${user.city}, ${user.state}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{user.phone || 'Not specified'}</p>
                  </div>
                  {user.linkedinUrl && (
                    <div>
                      <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        View Profile
                      </a>
                    </div>
                  )}
                  {user.githubUrl && (
                    <div>
                      <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experiences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Experiences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.experiences === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No experiences added yet</p>
                      <p className="text-sm">Start building your professional history</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowExperienceForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              Add Your First Experience
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              Click to create your first work experience
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((experience) => (
                      <div key={experience.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{experience.title}</h3>
                            <p className="text-gray-600">{experience.companyName}</p>
                            {experience.location && (
                              <p className="text-sm text-gray-500">{experience.location}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              {new Date(experience.startDate).toLocaleDateString()} - 
                              {experience.isCurrent ? 'Present' : experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'No end date'}
                            </p>
                            <div className="mt-2">
                              <RichTextDisplay content={experience.description} className="text-sm" />
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingExperience(experience);
                                setShowExperienceForm(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => setDeletingExperience(experience)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Ghost Add Card - Always shown when there are experiences */}
                    <div 
                      onClick={() => setShowExperienceForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              Add Another Experience
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              Click to add another work experience
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills & Abilities Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Skills & Abilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.skills === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No skills added yet</p>
                      <p className="text-sm">Showcase your technical and soft skills</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowSkillsForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              {portfolioStats.skills === 0 ? 'Add Your First Skill' : 'Add Another Skill'}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              {portfolioStats.skills === 0 
                                ? 'Click to create your first skill entry' 
                                : 'Click to add another skill'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {skills.map((skill) => (
                      <div key={skill.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{skill.name}</h3>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              {skill.category && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {skill.category}
                                </span>
                              )}
                              {skill.proficiency && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Level {skill.proficiency}/5
                                </span>
                              )}
                              {skill.yearsOfExperience && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                  {skill.yearsOfExperience} years
                                </span>
                              )}
                            </div>
                            <div className="mt-2">
                              <RichTextDisplay content={skill.description} className="text-sm" />
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingSkill(skill);
                                setShowSkillsForm(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => setDeletingSkill(skill)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Ghost Add Card - Always shown when there are skills */}
                    <div 
                      onClick={() => setShowSkillsForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              Add Another Skill
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              Click to add another skill
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Sections Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Custom Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolioStats.customSections === 0 ? (
                  <div className="space-y-4">
                    {/* Empty state message */}
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-lg">No custom sections added yet</p>
                      <p className="text-sm">Create custom content sections like STAR Memos, Project Showcases, or Speaking Engagements</p>
                    </div>
                    
                    {/* Ghost Add Card */}
                    <div 
                      onClick={() => setShowCustomSectionForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              {portfolioStats.customSections === 0 ? 'Add Your First Custom Section' : 'Add Another Custom Section'}
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              {portfolioStats.customSections === 0 
                                ? 'Click to create your first custom content section' 
                                : 'Click to add another custom section'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customSections.map((section) => (
                      <CustomSectionDisplay
                        key={section.id}
                        section={section}
                        onEdit={(section) => {
                          setEditingCustomSection(section);
                          setShowCustomSectionForm(true);
                        }}
                        onDelete={(section) => setDeletingCustomSection(section)}
                        onAddEntry={handleAddEntry}
                        onEditEntry={handleEditEntry}
                        onDeleteEntry={handleDeleteEntry}
                      />
                    ))}
                    
                    {/* Ghost Add Card - Always shown when there are sections */}
                    <div 
                      onClick={() => setShowCustomSectionForm(true)}
                      className="group cursor-pointer"
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                            <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-700 group-hover:text-blue-700">
                              Add Another Custom Section
                            </p>
                            <p className="text-sm text-gray-500 group-hover:text-blue-600">
                              Click to add another custom section
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="sidebar-sticky">
            <DashboardSidebar user={user} />
          </div>
        </div>
      </div>

      {/* Form Overlays */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowProfileForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <ProfileForm
                onClose={() => setShowProfileForm(false)}
                user={user}
              />
            </div>
          </div>
        </div>
      )}

      {showExperienceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowExperienceForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
                          <ExperienceForm
              onClose={() => {
                setShowExperienceForm(false);
                setEditingExperience(null);
              }}
              mode={editingExperience ? "edit" : "add"}
              initialData={editingExperience ? {
                id: editingExperience.id,
                title: editingExperience.title,
                companyName: editingExperience.companyName,
                description: editingExperience.description,
                startDate: editingExperience.startDate.toISOString().split('T')[0],
                endDate: editingExperience.endDate ? editingExperience.endDate.toISOString().split('T')[0] : '',
                isCurrent: editingExperience.isCurrent,
                location: editingExperience.location || '',
              } : undefined}
            />
            </div>
          </div>
        </div>
      )}

      {showSkillsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => setShowSkillsForm(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
                          <SkillsForm
              onClose={() => {
                setShowSkillsForm(false);
                setEditingSkill(null);
              }}
              mode={editingSkill ? "edit" : "add"}
              initialData={editingSkill ? {
                id: editingSkill.id,
                name: editingSkill.name,
                description: editingSkill.description,
                category: editingSkill.category || '',
                proficiency: editingSkill.proficiency || undefined,
                yearsOfExperience: editingSkill.yearsOfExperience || undefined,
              } : undefined}
            />
            </div>
          </div>
        </div>
      )}

      {showCustomSectionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => {
                  setShowCustomSectionForm(false);
                  setEditingCustomSection(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <CustomSectionForm
                onClose={() => {
                  setShowCustomSectionForm(false);
                  setEditingCustomSection(null);
                }}
                mode={editingCustomSection ? "edit" : "add"}
                initialData={editingCustomSection ? {
                  id: editingCustomSection.id,
                  title: editingCustomSection.title,
                  description: editingCustomSection.description || '',
                  type: editingCustomSection.type,
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Entry Form Modal */}
      {showEntryForm && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl my-8">
              <button
                onClick={() => {
                  setShowEntryForm(false);
                  setEditingEntry(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <EntryForm
                section={customSections.find(s => s.id === editingEntry.sectionId)!}
                entry={editingEntry.entry}
                onClose={() => {
                  setShowEntryForm(false);
                  setEditingEntry(null);
                }}
                onSubmit={handleEntrySubmit}
                mode={editingEntry.entryId ? "edit" : "add"}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal for Experiences */}
      <ConfirmationModal
        isOpen={!!deletingExperience}
        onClose={() => setDeletingExperience(null)}
        onConfirm={() => {
          if (deletingExperience) {
            const formData = new FormData();
            formData.append("_action", "deleteExperience");
            formData.append("experienceId", deletingExperience.id);
            formData.append("title", deletingExperience.title);
            formData.append("companyName", deletingExperience.companyName);
            submit(formData, { method: "post" });
          }
        }}
        title="Delete Experience"
        message={`Are you sure you want to delete "${deletingExperience?.title}" at ${deletingExperience?.companyName}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
      
      {/* Delete Confirmation Modal for Skills */}
      <ConfirmationModal
        isOpen={!!deletingSkill}
        onClose={() => setDeletingSkill(null)}
        onConfirm={() => {
          if (deletingSkill) {
            const formData = new FormData();
            formData.append("_action", "deleteSkill");
            formData.append("skillId", deletingSkill.id);
            formData.append("name", deletingSkill.name);
            submit(formData, { method: "post" });
          }
        }}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deletingSkill?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
      
      {/* Delete Confirmation Modal for Custom Sections */}
      <ConfirmationModal
        isOpen={!!deletingCustomSection}
        onClose={() => setDeletingCustomSection(null)}
        onConfirm={() => {
          if (deletingCustomSection) {
            const formData = new FormData();
            formData.append("_action", "deleteCustomSection");
            formData.append("sectionId", deletingCustomSection.id);
            formData.append("title", deletingCustomSection.title);
            submit(formData, { method: "post" });
          }
        }}
        title="Delete Custom Section"
        message={`Are you sure you want to delete "${deletingCustomSection?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Confirmation Modal for Entries */}
      <ConfirmationModal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={() => {
          if (deletingEntry) {
            const formData = new FormData();
            formData.append("_action", "deleteEntryFromCustomSection");
            formData.append("sectionId", deletingEntry.sectionId);
            formData.append("entryId", deletingEntry.entryId);
            submit(formData, { method: "post" });
          }
        }}
        title="Delete Entry"
        message={`Are you sure you want to delete this entry? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
