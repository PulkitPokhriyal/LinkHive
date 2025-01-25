import axios from "axios";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../../config";

interface TypeItem {
  type: string;
  _id: string;
}

export function useContent() {
  const [contents, setContents] = useState<
    Array<{
      _id: string;
      title: string;
      link: string;
      imageUrl: string;
      type: string;
      tags: Array<{ _id: string; tags: string }>;
    }>
  >([]);

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

  const fetchcontentTypes = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/api/v1/types", {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setTypes(response.data.types);
    } catch (e) {
      console.error("Error fetchcontentTypes:", e);
    }
  };

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

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    fetchcontentTypes();
  }, [types]);

  return { contents, refresh, types, fetchcontentTypes, fetchContentsByType };
}
