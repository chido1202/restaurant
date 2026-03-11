const getApiUrl = async () => {
    try {
      const res = await fetch("/api/config");
      const data = await res.json();
      return data.apiBaseUrl;
    } catch (error) {
      console.error("Lỗi lấy API URL:", error);
      return "http://localhost:5000/api"; // Dự phòng nếu lỗi
    }
  };
  
  export default getApiUrl;
  