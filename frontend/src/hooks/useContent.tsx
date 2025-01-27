import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../../config";
import { useRecoilState } from "recoil";
import { contentsAtom } from "../store/atoms/Content";
interface TypeItem {
  type: string;
  _id: string;
}

export function useContent() {
  const [contents, setContents] = useRecoilState(contentsAtom);
  const [types, setTypes] = useState<TypeItem[]>([]);

  const refresh = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/api/v1/content", {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setContents(response.data.contents);
    } catch (e) {
      console.error("Caught error:", e);
    }
  };

  useEffect(() => {
    const fetchcontentTypes = async () => {
      const response = await axios.get(BACKEND_URL + "/api/v1/types", {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setTypes(response.data.types);
    };

    fetchcontentTypes();
  }, [types]);

  const fetchContentsByType = async (typeId: string) => {
    try {
      console.log("Fetching contents for Type ID:", typeId);
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/types/${typeId}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        },
      );
      setContents(response.data.contents);
    } catch (e) {
      console.error("Error fetching content by type:", e);
    }
  };

  return { contents, refresh, types, fetchContentsByType };
}
