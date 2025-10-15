import Image from "next/image";

const RightBar = () => {
  return (
    <>
      <div className="fixed ">
        <div className="relative bg-olive p-5 mr-5 rounded-lg mb-5">
          <div>
            <Image
              src="/noavatar.png"
              alt="profile"
              width={50}
              height={50}
              className="rounded-full"
            />
          </div>
          <div className="flex flex-col gap-5">
            <span className="font-bold text-2xl">John Doe</span>
            <h3 className="text-xl">Software Engineer</h3>
            <span>Apakek</span>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Reprehenderit, quia. Quisquam, quod. Quisquam, quod. Quisquam,
              quod.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RightBar;
