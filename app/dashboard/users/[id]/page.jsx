import { updateUser } from "@/app/lib/action";
import { fetchUser } from "@/app/lib/data";
import Image from "next/image";

const SingleUserPage = async ({ params }) => {
  const { id } = params;
  const user = await fetchUser(id);

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        {user.name}
      </div>
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form action={updateUser} className="flex flex-col">
          <input type="hidden" name="id" value={user.id} />
          <label>Nama</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="username"
            placeholder={user.name}
          ></input>
          <label>Username</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="nama"
            placeholder={user.username}
          ></input>
          <label>Password</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="password"
          ></input>
          <label>Adalah admin ?</label>
          <select
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
            name="role"
            id="role"
          >
            <option value={true} selected={user.role}>
              Ya
            </option>
            <option value={false} selected={!user.role}>
              Tidak
            </option>
          </select>
          <button className="w-full mt-5 p-5 cursor-pointer bg-sage rounded-lg">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleUserPage;
