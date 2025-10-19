import Image from "next/image";

const SingleUserPage = () => {
  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        Semen
      </div>
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form action="" className="flex flex-col">
          <label>Nama Barang</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="username"
            placeholder="Nama Barang"
          ></input>
          <label>Harga</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="harga"
            placeholder="Harga"
          ></input>
          <label>Stock</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="stock"
            placeholder="Stok"
          ></input>
          <label>Kategori</label>
          <select
            name="cat"
            id="cat"
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
          >
            <option value="umum" disabled selected>
              Pilih Kategori
            </option>
            <option className="bg-olive " value="utama">
              Bahan Utama
            </option>
            <option className="bg-olive " value="cat">
              Cat & Pelapis
            </option>
            <option className="bg-olive " value="alat">
              Peralatan & Perkakas
            </option>
            <option className="bg-olive " value="sanitasi">
              Sanitasi
            </option>
            <option className="bg-olive " value="listrik">
              Kelistrikan
            </option>
            <option className="bg-olive " value="kayu">
              Kayu & Logam
            </option>
            <option className="bg-olive " value="inter">
              Interior & Finishing
            </option>
            <option className="bg-olive " value="ekster">
              Eksterior
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
