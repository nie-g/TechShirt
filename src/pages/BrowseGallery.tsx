import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageIcon, Search } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

import ClientNavbar from "../components/UsersNavbar";
import DynamicSidebar from "../components/Sidebar";

type DesignerRecord = {
  _id: Id<"designers">;
  user_id: Id<"users">;
  first_name?: string;
  last_name?: string;
  specialization?: string;
};

type GalleryRecord = {
  _id: Id<"galleries">;
  designer_id: Id<"designers">;
  title: string;
  caption?: string;
  created_at: number;
};

type GalleryImageRecord = {
  _id: Id<"gallery_images">;
  gallery_id: Id<"galleries">;
  image: Id<"_storage">;
  created_at: number;
};

type PortfolioRecord = {
  _id: Id<"portfolios">;
  designer_id: Id<"designers">;
  title?: string;
  description?: string;
  specialization?: string;
  skills?: string[];
  social_links?: { platform: string; url: string }[];
};

const BrowseGallery: React.FC = () => {
  const [search, setSearch] = useState("");
  const [expandedDesigners, setExpandedDesigners] = useState<Record<string, boolean>>({});
  const [expandedPortfolios, setExpandedPortfolios] = useState<Record<string, boolean>>({});

  // Queries
  const designers = useQuery(api.designers.listAllDesignersWithUsers) as DesignerRecord[] | undefined;
  const galleries = useQuery(api.gallery.listAllGalleries) as GalleryRecord[] | undefined;
  const imagesByGallery = useQuery(api.gallery.getAllImages) as Record<string, GalleryImageRecord[]> | undefined;
  const portfolios = useQuery(api.portfolio.listAllPortfolios) as PortfolioRecord[] | undefined;

  const allStorageIds = useMemo(() => {
    if (!imagesByGallery) return [];
    return Object.values(imagesByGallery).flatMap((imgs) => imgs.map((i) => i.image));
  }, [imagesByGallery]);

  const previewUrls = useQuery(
    api.gallery.getPreviewUrls,
    allStorageIds.length > 0 ? { storageIds: allStorageIds } : "skip"
  ) as Record<string, string> | undefined;

  // Filter designers by search
  const filteredDesigners = useMemo(() => {
    if (!designers || !galleries) return [];
    return designers.filter((designer) => {
      const designerGalleries = galleries.filter((g) => g.designer_id === designer._id);
      const designerPortfolios = portfolios?.filter((p) => p.designer_id === designer._id) ?? [];

      return (
        designerGalleries.some(
          (g) =>
            g.title.toLowerCase().includes(search.toLowerCase()) ||
            g.caption?.toLowerCase().includes(search.toLowerCase())
        ) ||
        designerPortfolios.some(
          (p) =>
            p.title?.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase()) ||
            (p.specialization ?? "").toLowerCase().includes(search.toLowerCase())
        ) ||
        `${designer.first_name ?? ""} ${designer.last_name ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [designers, galleries, portfolios, search]);

  const toggleSeeMore = (designerId: string) => {
    setExpandedDesigners((prev) => ({
      ...prev,
      [designerId]: !prev[designerId],
    }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen bg-gradient-to-br from-white to-teal-50">
      <DynamicSidebar />
      <div className="flex-1 flex flex-col">
        <ClientNavbar />
        <main className="p-8 md:p-10 overflow-auto w-full max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-semibold mb-6 text-gray-700"> Designer Galleries and Portfolio</h1>

            {/* Search Bar */}
            <div className="flex items-center mb-10 max-w-lg w-full border border-gray-300 rounded-full shadow-sm bg-white/70 backdrop-blur-md focus-within:ring-2 focus-within:ring-teal-500 transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                placeholder="Search by designer or gallery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 p-3 bg-transparent outline-none text-gray-700"
              />
            </div>

            {/* Designer Galleries */}
            {filteredDesigners.length > 0 ? (
              <div className="space-y-10">
                {filteredDesigners.map((designer) => {
                  const designerGalleries = galleries?.filter((g) => g.designer_id === designer._id) ?? [];
                  const designerImages = designerGalleries.flatMap((g) => imagesByGallery?.[g._id] ?? []);
                  const designerPortfolios = portfolios?.filter((p) => p.designer_id === designer._id) ?? [];

                  const specialization =
                    (designer.specialization && designer.specialization.trim()) ||
                    (designerPortfolios.map((p) => p.specialization).filter(Boolean)[0] ?? null);

                  const showAll = expandedDesigners[designer._id];
                  const displayedImages = showAll ? designerImages : designerImages.slice(0, 5);

                  return (
                    <motion.div
                      key={designer._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-white/70 backdrop-blur-md rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Designer Header */}
                      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-white">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                          {designer.first_name} {designer.last_name}
                        </h2>
                        <div className="flex flex-col gap-2 sm:gap-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {specialization && (
                              <span className="text-xs sm:text-sm font-medium text-teal-600 bg-teal-100 px-2.5 py-1 rounded-full w-fit">
                                {specialization}
                              </span>
                            )}
                            {designerPortfolios.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setExpandedPortfolios((prev) => ({
                                  ...prev,
                                  [designer._id]: !prev[designer._id],
                                }))}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-full transition-all whitespace-nowrap w-fit"
                              >
                                {expandedPortfolios[designer._id] ? "Hide" : "See Portfolio"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Portfolio Details Section */}
                      {designerPortfolios.length > 0 && designerPortfolios[0] && expandedPortfolios[designer._id] && (
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                          <div className="space-y-3">
                            {designerPortfolios[0].title && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Portfolio Title</p>
                                <p className="text-sm text-gray-800 font-medium">{designerPortfolios[0].title}</p>
                              </div>
                            )}

                            {designerPortfolios[0].description && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">About</p>
                                <p className="text-sm text-gray-700 line-clamp-2">{designerPortfolios[0].description}</p>
                              </div>
                            )}

                            {designerPortfolios[0].skills && designerPortfolios[0].skills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {designerPortfolios[0].skills.map((skill, idx) => (
                                    <span key={idx} className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {designerPortfolios[0].social_links && designerPortfolios[0].social_links.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Connect</p>
                                <div className="flex flex-wrap gap-2">
                                  {designerPortfolios[0].social_links.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-white border border-teal-300 text-teal-700 px-2.5 py-1 rounded-full font-medium hover:bg-teal-50 transition-colors"
                                    >
                                      {link.platform}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Image Gallery */}
                      {designerImages.length > 0 ? (
                        <div className="p-7">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {displayedImages.map((img) => (
                              <motion.div
                                key={img._id}
                                whileHover={{ scale: 1.03 }}
                                className="relative group aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-gray-100"
                              >
                                {previewUrls?.[img.image.toString()] ? (
                                  <img
                                    src={previewUrls[img.image.toString()]}
                                    alt="Gallery"
                                    className="object-cover w-full h-full group-hover:opacity-90 transition-opacity"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}

                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-sm font-medium">
                                  {designerGalleries.find((g) => g._id === img.gallery_id)?.title || "Gallery Image"}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* See More / See Less Button */}
                          {designerImages.length > 5 && (
                            <div className="text-center mt-5">
                              <button
                                onClick={() => toggleSeeMore(designer._id)}
                                className="px-5 py-2 text-sm font-medium text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-full transition-all"
                              >
                                {showAll ? "See Less" : "See More"}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                          No images uploaded
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-10">No designers found</p>
            )}
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
};

export default BrowseGallery;
