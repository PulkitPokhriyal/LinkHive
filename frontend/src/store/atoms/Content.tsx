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
