import { addProduct } from "@/app/lib/action";

const AddProductPage = () => {
  return (
    <div className="bg-olive p-5 rounded-lg mt-5 ">
      <form action={addProduct} className="flex flex-wrap justify-between">
        <input
          type="text"
          placeholder="Nama Produk"
          name="name"
          className="bg-transparent w-5/12 border border-lightOlive p-7  rounded-lg mb-7"
          required
        />
        <select
          name="kate"
          id="kate"
          className="bg-transparent w-5/12 border  border-lightOlive p-7 rounded-lg mb-7"
          required
        >
          <option value="" disabled selected>
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

        <input
          type="number"
          placeholder="Stok"
          name="stok"
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />

        <input
          type="text"
          placeholder="Satuan"
          name="satuan"
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />
        <input
          type="number"
          placeholder="Harga"
          name="harga"
          className="bg-transparent border border-lightOlive p-7 w-5/12 rounded-lg mb-7"
        />
        <textarea
          name="desc"
          id="desc"
          cols="30"
          rows="5"
          placeholder="Deskripsi"
          className="bg-transparent w-full border border-lightOlive p-7 rounded-lg mb-7"
        />
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

export default AddProductPage;
