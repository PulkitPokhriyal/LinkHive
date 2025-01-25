import axios from "axios";
import { BACKEND_URL } from "../../config";
export function deleteItem(contentId: string) {
  const deleteContent = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
    } catch (e) {
      console.error("Error deleting content", e);
    }
  };
  deleteContent();
}
