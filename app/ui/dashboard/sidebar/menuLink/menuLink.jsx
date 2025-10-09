import Link from "next/link";

const MenuLink = ({ item }) => {
  return (
    <Link href={item.path} className="">
      {item.icon}
      {item.title}
    </Link>
  );
};

export default MenuLink;