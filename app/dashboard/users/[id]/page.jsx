import Image from "next/image";

const SingleUserPage = () => {
  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        Nico Suwanto
      </div>
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form action="" className="flex flex-col">
          <label>Nama</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="username"
            placeholder="Nico Wanto"
          ></input>
          <label>Username</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="nama"
            placeholder="wanto123"
          ></input>
          <label>Password</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="username"
            placeholder="1234"
          ></input>
          <label>Adalah admin ?</label>
          <select
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            name="isAdmin"
            id="isAdmin"
          >
            <option value={true}>Ya</option>
            <option value={false}>Tidak</option>
          </select>
          <button className="w-full mt-5 p-5 cursor-pointer bg-sage rounded-lg">Update</button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;
