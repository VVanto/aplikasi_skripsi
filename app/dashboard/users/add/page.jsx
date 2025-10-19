const AddUserPage = () => {
  return (
    <div className="bg-olive p-5 rounded-lg mt-5">
      <form className="flex flex-wrap justify-between">
        <input
          type="text"
          placeholder="Nama Pengguna"
          name="name"
          className="bg-transparent w-5/12 border border-lightOlive p-7  rounded-lg mb-7"
          required
        />
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />

        <select
          name="role"
          id="role"
          className="bg-olive  w-5/12 border border-lightOlive p-7 rounded-lg mb-7"
        >
          <option value="false" disabled selected className="bg-olive">
            Apakah ini akun admin ?
          </option>
          <option value={true} className="bg-olive ">
            Ya
          </option>
          <option value={false} className="bg-olive ">
            Tidak
          </option>
        </select>

        <button
          className="w-full p-3 bg-sage rounded-lg cursor-pointer border-none"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddUserPage;
