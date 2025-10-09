import {
  MdAnalytics,
  MdAttachMoney,
  MdDashboard,
  MdHelpCenter,
  MdOutlineSettings,
  MdPeople,
  MdShoppingBag,
  MdSupervisedUserCircle,
  MdWork,
} from "react-icons/md";
import MenuLink from "./menuLink/menuLink";
import Image from "next/image";

const menuItems = [
  {
    titles: "Pages",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdSupervisedUserCircle />,
      },
      {
        title: "Products ",
        path: "/dashboard/products",
        icon: <MdShoppingBag />,
      },
      {
        title: "Messages",
        path: "/dashboard/transaction",
        icon: <MdAttachMoney />,
      },
    ],
  },
  {
    titles: "Analytics",
    list: [
      {
        title: "Revenue",
        path: "/dashboard/revenue",
        icon: <MdWork />,
      },
      {
        title: "Reports",
        path: "/dashboard/reports",
        icon: <MdAnalytics />,
      },
      {
        title: "Teams",
        path: "/dashboard/teams",
        icon: <MdPeople />,
      },
    ],
  },
  {
    titles: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/dashboard/help",
        icon: <MdHelpCenter />,
      },
    ],
  },
];

const Sidebar = () => {
  return (
    <div className="sticky top-10">
      <div className="flex items-center gap-5 mb-5">
        <Image
          src="/noavatar.png"
          alt=""
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="font-medium">Wanto</span>
          <span className="text-sm text-cream">Administrator</span>
        </div>
      </div>
      <ul className="list-none">
        {menuItems.map((cat) => (
          <li key={cat.titles}>
            <span className="">{cat.titles}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
