export default function LoginPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <form
        action=""
        className="bg-olive p-12 rounded-lg w-[500px] h-[500px] flex flex-col justify-center"
      >
        <h1 className="text-6xl mb-16">Login</h1>
        <input
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive"
          type=""
          placeholder="Username"
        />
        <input
          className="px-7 py-4 my-2 w-full border border-lightOlive rounded-lg bg-olive"
          type=""
          placeholder="Password"
        />
        <button className="px-7 py-4 mt-10 bg-sage cursor-pointer rounded-lg">
          Login
        </button>
      </form>
    </div>
  );
}
