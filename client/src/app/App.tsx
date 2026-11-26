import { ROUTES } from '@/shared/config';


function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-xl font-bold">ICHgram</h1>
      <p className="text-secondary">Home: {ROUTES.home}</p>
      <button className="h-8 rounded-lg bg-primary px-4 font-semibold text-white hover:bg-primary-hover">
        Log in
      </button>
    </main>
  );
}

export default App;
