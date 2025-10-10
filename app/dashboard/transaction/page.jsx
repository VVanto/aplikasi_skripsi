import { Bodoni_Moda } from "next/font/google";

const bodoni = Bodoni_Moda({
  weight: ["400"],
  subsets: ["latin"]
});

const Transaction = () => {
  return (
    <div className="bg-olive p-5 rounded-lg ">
      <h2 className={`mb-5 text-2xl ${bodoni.className}`}>Transaksi terbaru</h2>
      <table className="w-full ">
        <thead>
          <tr>
            <td>Nama</td>
            <td>Status</td>
            <td>Tanggal</td>
            <td>Jumlah</td>
          </tr>
        </thead>
        <tbody>
          <tr className="p-3">
            <td>John Doe</td>
            <td>
              <span className="rounded-md p-1 text-sm text-white bg-yellow-700">Pending</span>
            </td>
            <td>26.10.2025</td>
            <td>Rp 1.000.000</td>
          </tr>
 
        </tbody>
      </table>
    </div>
  );
};

export default Transaction;
