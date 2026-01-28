import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { LogOut, User } from "lucide-react";

const LearnHeader = ({
    colorMode,
    toggleColorMode,
    userName,
    open,
    setOpen,
    dropdownRef,
    onLogout,
    onProfileClick
}) => {
    const isDark = colorMode === "dark";

    return (
        <div className="sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
            <div
                className={`flex items-center justify-between px-10 py-3 ${isDark
                    ? "bg-gray-900/95 border-b border-gray-400"
                    : "bg-white/95 border-b border-gray-200 shadow-sm"
                    }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-5">
                    {/* SVG Logo - color adapts to theme */}
                    {/* <svg
                        width="45"
                        height="45"
                        viewBox="0 0 119 128"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="flex-shrink-0"
                    >
                        <path d="M66.3197 37.7786C66.7032 37.6281 67.0941 37.98 66.9844 38.3772L66.1302 41.4728C65.9317 42.1922 66.2921 42.9479 66.9761 43.2463L69.92 44.5303C70.2976 44.6951 70.3251 45.2207 69.9668 45.424L67.1733 47.0087C66.5242 47.3771 66.2447 48.1663 66.5174 48.861L67.6905 51.8503C67.8411 52.2339 67.4891 52.6248 67.092 52.5151L63.9964 51.6609C63.2769 51.4623 62.5213 51.8228 62.2228 52.5068L60.9388 55.4507C60.7741 55.8283 60.2484 55.8558 60.0451 55.4975L58.4604 52.704C58.0921 52.0549 57.3029 51.7754 56.6081 52.0481L53.6188 53.2212C53.2353 53.3718 52.8444 53.0198 52.954 52.6226L53.8083 49.5271C54.0068 48.8076 53.6463 48.052 52.9623 47.7535L50.0185 46.4695C49.6409 46.3047 49.6133 45.7791 49.9716 45.5758L52.7651 43.9911C53.4142 43.6228 53.6937 42.8336 53.4211 42.1388L52.2479 39.1495C52.0974 38.766 52.4493 38.3751 52.8465 38.4847L55.9421 39.339C56.6615 39.5375 57.4172 39.177 57.7156 38.493L58.9996 35.5491C59.1644 35.1716 59.69 35.144 59.8934 35.5023L61.478 38.2958C61.8464 38.9449 62.6356 39.2244 63.3303 38.9518L66.3197 37.7786Z" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <path d="M59.4688 20V32.5" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M71.9688 23.5L64.9687 34.5" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M80.9219 32.5L69.9692 38.524" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M85.9688 44.5H72.9688" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M71.1416 66.8796L65.9691 55.5001" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M48.9688 66.5L54.1413 55.1204" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M34.9688 44.5H47.4688" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M47.9688 23.5L53.9544 34.4737" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M38.9688 32.5L49.6874 38.9312" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M70.9908 10.2758C71.7324 9.28966 71.2129 7.871 69.9986 7.65182C65.1225 6.77162 59.8876 6.50313 54.5444 6.86462C48.2501 7.29045 41.9501 8.58072 36.0642 10.6494C30.1783 12.7182 24.8416 15.5178 20.4097 18.8619C16.898 21.5117 14.0183 24.455 11.8842 27.5655C11.0906 28.7222 11.8554 30.2414 13.246 30.4262L13.5301 30.4639C14.3511 30.573 15.148 30.1609 15.5841 29.4568C17.5342 26.3085 20.336 23.3304 23.8465 20.6815C27.7957 17.7016 32.5513 15.2068 37.7962 13.3634C43.0412 11.52 48.6551 10.3702 54.2639 9.99074C59.4684 9.63863 64.5575 9.95726 69.2399 10.9254C69.9007 11.062 70.5853 10.8151 70.9908 10.2758V10.2758Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="72.9688" cy="10" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="11.9688" cy="30" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="37.9688" cy="21" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <path d="M37.1252 19.2455C29.631 22.2103 22.8624 26.6343 17.2493 32.2365C11.6361 37.8387 7.30101 44.4968 4.51906 51.7883C1.73711 59.0797 0.569106 66.8451 1.08919 74.5917C1.60928 82.3382 3.8061 89.8966 7.5402 96.7872L10.5988 95.2683C7.08463 88.7836 5.0172 81.6704 4.52775 74.3801C4.03829 67.0898 5.1375 59.7818 7.75559 52.9198C10.3737 46.0579 14.4535 39.7919 19.736 34.5197C25.0185 29.2474 31.3884 25.0841 38.4413 22.2939L37.1252 19.2455Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <path d="M31.8796 120.443C25.389 117.098 19.6093 112.583 14.8478 107.138L17.5221 104.919C21.9953 110.034 27.4248 114.276 33.5224 117.418L31.8796 120.443Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <path d="M52.2451 16.1167C52.1231 15.2074 52.7664 14.3709 53.6797 14.2826C63.7778 13.3065 73.9741 14.861 83.2622 18.8061C93.0583 22.967 101.467 29.6272 107.57 38.0589C113.673 46.4906 117.234 56.3694 117.866 66.6158C118.464 76.3204 116.412 86.0011 111.926 94.7092C111.506 95.5244 110.504 95.8306 109.686 95.4165V95.4165C108.824 94.9802 108.499 93.9165 108.938 93.0557C113.089 84.9119 114.985 75.8746 114.426 66.8151C113.832 57.1722 110.48 47.8753 104.737 39.9402C98.9934 32.0052 91.0798 25.7373 81.8607 21.8214C73.14 18.1173 63.5685 16.6526 54.0867 17.558C53.1857 17.6441 52.3653 17.0138 52.2451 16.1167V16.1167Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="107.969" cy="42" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <path d="M39.2738 123.557C48.0974 126.664 57.5734 127.69 66.8989 126.546C76.2244 125.403 85.1248 122.126 92.846 116.991L90.8801 114.282C83.6136 119.114 75.2375 122.199 66.4613 123.275C57.685 124.351 48.7672 123.386 40.4632 120.462L39.2738 123.557Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="90.9688" cy="117" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <circle cx="39.9688" cy="122" r="3.5" fill={isDark ? "white" : "#1e3a5f"} stroke={isDark ? "white" : "#1e3a5f"} />
                        <line x1="48.4848" y1="86.0725" x2="53.4848" y2="78.0725" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" />
                        <path d="M61.2731 68.8328C61.796 68.02 61.5609 66.9371 60.748 66.4143C59.9352 65.8914 58.8523 66.1265 58.3295 66.9394L59.8013 67.8861L61.2731 68.8328ZM55.1475 75.1213L56.6193 76.068L61.2731 68.8328L59.8013 67.8861L58.3295 66.9394L53.6756 74.1746L55.1475 75.1213Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <path d="M70.9347 86.0211L65.9729 78.0622" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" />
                        <path d="M61.4788 67.1161C60.9906 66.282 59.9187 66.0016 59.0845 66.4897C58.2504 66.9779 57.9699 68.0499 58.4581 68.884L59.9685 68.0001L61.4788 67.1161ZM64.3623 75.5076L65.8726 74.6236L61.4788 67.1161L59.9685 68.0001L58.4581 68.884L62.852 76.3915L64.3623 75.5076Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <path d="M8.96875 105C8.96875 105 21.3296 106.976 29.4688 109C41.3387 111.952 59.9688 118 59.9688 118C59.9688 118 78.5612 112.12 90.9688 109C98.5482 107.094 109.969 105 109.969 105" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M17.9688 96L32.9688 101C32.9688 101 43.0986 105.213 48.9688 109C53.5305 111.943 59.9688 117.5 59.9688 117.5C59.9688 117.5 66.3125 111.521 70.9688 108.5C76.7579 104.744 86.9688 101 86.9688 101L100.969 97" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M89.9658 50.9932L78.7993 55.6534" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M38.9688 56L28.9688 51" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M17.9688 49L17.9687 96" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M28.9688 51L28.9687 90" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M89.9688 51L89.9687 90" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M70.9688 97L89.9687 90" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" />
                        <path d="M61.7188 84C61.7188 83.0335 60.9352 82.25 59.9688 82.25C59.0023 82.25 58.2188 83.0335 58.2188 84H59.9688H61.7188ZM58.2188 99.5V101.25H61.7188V99.5H59.9688H58.2188ZM59.9688 84H58.2188V99.5H59.9688H61.7188V84H59.9688Z" fill={isDark ? "white" : "#1e3a5f"} />
                        <path d="M59.9688 84L44.9687 97" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M28.9688 90L44.9687 97" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M8.96875 60L8.96875 105" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M109.969 60V105" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M100.969 49L100.969 97" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M71.0045 51.6358L77.9691 56" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                        <path d="M39.554 56.5874L47.9686 52" stroke={isDark ? "white" : "#1e3a5f"} strokeWidth="2" strokeLinecap="round" />
                    </svg> */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                            src="learn_logo.svg"
                            alt="logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {/* <h1 className={`font-bold text-xl md:text-2xl ${isDark ? "text-white" : "text-gray-800"}`}> */}
                    <h1 className={`font-bold text-xl md:text-2xl text-cyan-400`}>
                        VidhyanAI
                    </h1>
                </div>

                {/* Right Section - includes dropdown */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleColorMode}
                        className={`p-3 rounded-lg transition-all ${isDark
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                        title="Toggle theme"
                    >
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>

                    {/* User Button and Dropdown Container */}
                    <div className="relative" ref={dropdownRef}>
                        {/* User Button */}
                        <button
                            onClick={() => setOpen(prev => !prev)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isDark
                                ? "bg-gray-700 hover:bg-gray-600 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            <img src="/user.png" className="w-5 h-5 rounded-full" alt="User" />
                            <span className="font-medium">{userName}</span>
                        </button>

                        {/* Dropdown Menu - now inside the ref container */}
                        {open && (
                            <div
                                className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border z-50 flex flex-col gap-1 ${isDark
                                    ? "bg-gray-800 border-gray-600"
                                    : "bg-white/50 border-gray-200"
                                    }`}
                            >
                                <button
                                    onClick={() => {
                                        if (onProfileClick) {
                                            onProfileClick();
                                        }
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-md font-medium flex flex-row gap-3 transition-all ${isDark
                                        ? "bg-gray-900 text-gray-200 hover:bg-gray-700"
                                        : "bg-gray-200 text-gray-800 hover:bg-gray-100"
                                        }`}
                                >
                                    <User /> Profile
                                </button>
                                <button
                                    onClick={() => {
                                        if (onLogout) {
                                            onLogout();
                                        }
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-md font-medium text-red-500 flex flex-row gap-3 transition-all ${isDark
                                        ? "bg-gray-900 hover:bg-red-900/50"
                                        : "bg-gray-200 hover:bg-red-50"
                                        }`}
                                >
                                    <LogOut size={24} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearnHeader;

