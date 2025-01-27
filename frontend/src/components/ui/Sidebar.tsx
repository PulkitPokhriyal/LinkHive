interface TypeItem {
  type: string;
  _id: string;
}

interface Sidebarprops {
  types: TypeItem[];
  onTypeClick: (typeId: string) => void;
}

export const Sidebar = ({ types, onTypeClick }: Sidebarprops) => {
  return (
    <div className="bg-accent w-72 fixed top-0 pl-4 pt-10 h-screen">
      <div className="flex gap-2 items-center">
        <img src="/Icon.png" className="h-14 w-14" alt="Icon" />
        <h1 className="text-3xl font-sans font-bold">LinkHive</h1>
      </div>
      <div className="mt-12 flex flex-col pl-16 gap-4 hover:cursor-pointer text-xl font-semibold">
        {types.map((type) => (
          <p
            key={type._id}
            onClick={() => onTypeClick(type._id)}
            className="hover:underline"
          >
            {type.type}
          </p>
        ))}
      </div>
    </div>
  );
};
