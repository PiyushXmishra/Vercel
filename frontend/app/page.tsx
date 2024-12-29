"use client";
import { useState } from "react";
import axios from "axios";
import Particles from "@/components/ui/particles";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function GithubRepoInput() {
  const [repoUrl, setRepoUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [color, setColor] = useState("#ffffff");

  const handleInputChange = (e: any) => {
    setRepoUrl(e.target.value);
  };

  const handleSubmit = () => {
    if (!repoUrl) {
      alert("Please enter a GitHub repository URL.");
      return;
    }
      setSiteUrl("");
    axios.post(`${process.env.NEXT_PUBLIC_UPLOAD_HANDLER}`, { repoUrl }).then((res) => {
      const id = res.data.id;

      if (id) {
        // Set the dynamically generated URL for the user to visit
        setSiteUrl(`${process.env.NEXT_PUBLIC_PROTOCOL}://${id}.${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}`);
      }
    });

    console.log("Submitted GitHub Repo URL:", repoUrl);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Particles
        className="absolute inset-0 z-0"
        quantity={50}
        ease={80}
        color={color}
        refresh
      />

      <Navbar />
      <div className="flex flex-col items-center  min-h-screen bg-black text-white">
        <div className="bg-gradient-to-br from-white from-30% to-white/40 bg-clip-text pt-28 p-4 max-w-6xl text-center text-5xl font-medium leading-none tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl ">
          Deploy and host your React App in seconds!
        </div>

        <div className="text-white/50 text-2xl p-4 text-center ">
          Get your project live on a unique subdomain with ease.
        </div>

        <div className="flex w-full flex-row max-w-xl items-center justify-center pt-10 ">
          <Input
            type="text"
            className="rounded-3xl border-2 border-gray-800 hover:border-gray-500 p-6 text-xl "
            placeholder="e.g., https://github.com/user/repo"
            value={repoUrl}
            onChange={handleInputChange}
          />
          <Button
            type="submit"
            className="rounded-3xl border-2 border-gray-800 hover:border-gray-500 p-6 "
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
        {siteUrl && (
          <div className="pt-5">
            <Button className="text-white  ">
              <a href={siteUrl} target="_blank" className="flex items-center ">
                <span>Your Site</span>
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
