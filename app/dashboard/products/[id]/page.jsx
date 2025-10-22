import { updateProduct } from "@/app/lib/action";
import { fetchProduct } from "@/app/lib/data";
import Image from "next/image";

const SingleProductPage = async ({ params }) => {
  const { id } = params;
  const product = await fetchProduct(id);

  return (
    <div className="flex gap-5 mt-5">
      <div className="flex flex-col flex-1 bg-olive p-5 rounded-lg h-max">
        <div className="w-full h-[300px] relative rounded-lg overflow-hidden mb-5">
          <Image src="/noavatar.png" alt="" fill />
        </div>
        {product.name}
      </div>
      <div className="flex-[3] bg-olive p-5 rounded-lg">
        <form action={updateProduct} className="flex flex-col">
          <input type="hidden" name="id" value={product.id} />
          <label>Nama Produk</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="text"
            name="name"
            placeholder={product.name}
          ></input>
          <label>Harga</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="harga"
            defaultValue={product.harga}
            step="10000"
            min="0"
          ></input>
          <label>Stok</label>
          <input
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3 "
            type="number"
            name="stok"
            defaultValue={product.stok}
          ></input>
          <label>Kategori</label>
          <select
            name="kate"
            id="kate"
            className="p-5 border border-lightOlive rounded-lg bg-olive my-3"
          >
            <option value="umum" disabled selected>
              Pilih Kategori
            </option>
            <option className="bg-olive " value="Bahan Utama">
              Bahan Utama
            </option>
            <option className="bg-olive " value="Cat & Pelapis">
              Cat & Pelapis
            </option>
            <option className="bg-olive " value="Peralatan & Perkakas">
              Peralatan & Perkakas
            </option>
            <option className="bg-olive " value="Sanitasi">
              Sanitasi
            </option>
            <option className="bg-olive " value="Kelistrikan">
              Kelistrikan
            </option>
            <option className="bg-olive " value="Kayu & Logam">
              Kayu & Logam
            </option>
            <option className="bg-olive " value="Interior & Finishing">
              Interior & Finishing
            </option>
            <option className="bg-olive " value="Eksterior">
              Eksterior
            </option>
          </select>
          <label>Deskripsi</label>
          <textarea
            name="deskrip"
            id="deskrip"
            cols="30"
            rows="5"
            placeholder={product.deskrip}
            className="bg-transparent w-full border border-lightOlive p-7 rounded-lg mb-7"
          />
          <button className="w-full mt-5 p-5 cursor-pointer bg-sage rounded-lg">
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default SingleProductPage;
