import { atom } from "recoil";

export const contentsAtom = atom<
  Array<{
    _id: string;
    title: string;
    link: string;
    imageUrl: string;
    type: string;
    tags: Array<{ _id: string; tags: string }>;
  }>
>({
  key: "contentsAtom",
  default: [],
});

export const contentAtomById = atom<{
  _id: string;
  title: string;
  link: string;
  imageUrl: string;
  type: { _id: string; type: string };
  tags: Array<{ _id: string; tags: string }>;
}>({
  key: "contentAtomById",
  default: {
    _id: "",
    title: "",
    link: "",
    imageUrl: "",
    type: { _id: "", type: "" },
    tags: [],
  },
});

export const sharelinkAtom = atom<{
  hash: string;
}>({
  key: "sharelinkAtom",
  default: {
    hash: "",
  },
});
