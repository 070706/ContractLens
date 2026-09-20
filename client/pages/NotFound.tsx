import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5"><div className="text-center"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#63a993]">ContractLens</p><h1 className="mt-3 text-5xl font-bold text-[#183448]">404</h1><p className="mt-2 text-[13px] text-[#718391]">This screen has not been built yet.</p><Link to="/" className="mt-5 inline-flex rounded-xl bg-[#183448] px-4 py-2.5 text-[11px] font-bold text-white">Return home</Link></div></div>;
};

export default NotFound;
