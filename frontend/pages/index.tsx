import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error connecting to backend"));
  }, []);

  return (
    <div>
      <h1>Frontend Connected!</h1>
      <p>{message}</p>
    </div>
  );
}
