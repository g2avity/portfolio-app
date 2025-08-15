export default function HealthCheck() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600">Healthy</h1>
        <p className="mt-2 text-gray-600">Application is running successfully</p>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
}
