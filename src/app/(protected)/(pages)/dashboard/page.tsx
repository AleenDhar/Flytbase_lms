"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

const page = () => {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);
  if (user !== null) {
    console.log(user);
    return <div>{user.user_metadata.full_name ?? "user"}</div>;
  }
  // return <div>hi</div>;
};

export default page;
