import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <div className="container px-4 2xl:px-20 mx-auto flex items-center justify-between gap-4 py-3 -mt-20">
      <div className="flex items-center gap-1">
        <img height={37} width={37} src={assets.company_logo} alt="" />
        <div className="flex items-center gap-0 mt-1">
          <span className="font-bold text-slate-700 text-2xl">Insta</span>
          <span className="font-bold text-cyan-500 text-2xl">Jobs</span>
        </div>
      </div>
      <p className="flex-1 border-l mt-2 border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden">
        Copyright @Mukhlisbek.IO | All rights reserved.
      </p>
      <div className="flex gap-2.5">
        <img width={38} src={assets.facebook_icon} alt="" />
        <img width={38} src={assets.twitter_icon} alt="" />
        <img width={38} src={assets.instagram_icon} alt="" />
      </div>
    </div>
  );
};

export default Footer;
