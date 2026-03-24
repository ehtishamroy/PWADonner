import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Search,
    ShoppingCart,
    Edit2,
    CheckCircle,
    Home as HomeIcon,
    Package,
    User,
    UploadCloud,
    ThumbsUp,
    Box,
    ChevronDown,
    Menu,
    X
} from 'lucide-react';

/**
 * BRAND DESIGN TOKENS
 * Strict adherence to Bricolage Grotesque (27px/30px) and Inter (15px/20px)
 */
const BRAND = {
    green: '#537D61',
    greenDark: '#335E52',
    greenBright: '#9DBDA7',
    beige: '#F5F0EA',
    white: '#FFFFFF',
    font: '#000000',
    mustard: '#E8B870',
    lila: '#A8ADED',
    redBright: '#F1997D',
    error: '#DE0000',
    headingFont: '"Bricolage Grotesque", sans-serif',
    bodyFont: '"Inter", sans-serif'
};

const textStyle = (type) => {
    if (type === 'h1') return { fontFamily: BRAND.headingFont, fontWeight: 700, fontSize: '27px', lineHeight: '30px', letterSpacing: '0.01em' };
    if (type === 'h2') return { fontFamily: BRAND.headingFont, fontWeight: 700, fontSize: '20px', lineHeight: '24px', letterSpacing: '0.01em' };
    if (type === 'body') return { fontFamily: BRAND.bodyFont, fontWeight: 400, fontSize: '15px', lineHeight: '20px', letterSpacing: '0%' };
    if (type === 'button') return { fontFamily: BRAND.headingFont, fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em' };
    return {};
};

/**
 * ILLUSTRATIONS & LOGO
 */
const HeartHugLogo = ({ size = 180, animated = false }) => (
    <div className="relative">
        {animated && <style dangerouslySetInnerHTML={{ __html: `@keyframes hp{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}} @keyframes hs{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.05)}} .a-h{animation:hp 2s infinite;transform-origin:center} .a-s{animation:hs 2s infinite;transform-origin:center}` }} />}
        <svg width={size} height={(size * 110) / 120} viewBox="0 0 100 100" fill="none">
            <path className={animated ? "a-h" : ""} d="M50 88.7C47.8 88.7 15 67.5 15 39.5C15 23.5 28.5 15 40 15C44.5 15 47.8 16.5 50 19.5C52.2 16.5 55.5 15 60 15C71.5 15 85 23.5 85 39.5C85 67.5 52.2 88.7 50 88.7Z" fill={BRAND.green} />
            <path className={animated ? "a-s" : ""} d="M38 55C38 55 42 59 50 59C58 59 62 55 62 55M73 48L65 54M27 48L35 54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    </div>
);

const HelicopterIcon = () => (
    <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
        <path d="M20 50C20 40 30 35 50 35C70 35 80 40 80 50C80 65 65 70 50 70C35 70 20 65 20 50Z" fill={BRAND.mustard} stroke="black" strokeWidth="2.5" />
        <path d="M50 35V25M30 25H70M50 25L45 20M50 25L55 20" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="45" cy="50" r="8" fill="white" stroke="black" strokeWidth="2" />
    </svg>
);

const TeddyIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
        <circle cx="35" cy="30" r="12" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <circle cx="65" cy="30" r="12" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <path d="M25 50C25 35 75 35 75 50C75 75 25 75 25 50Z" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="18" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
    </svg>
);

const CarIcon = () => (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none">
        <path d="M15 55H105V45C105 35 95 25 75 25H45C25 25 15 35 15 45V55Z" fill="white" stroke="black" strokeWidth="2.5" />
        <circle cx="35" cy="60" r="8" fill="white" stroke="black" strokeWidth="2.5" />
        <circle cx="85" cy="60" r="8" fill="white" stroke="black" strokeWidth="2.5" />
    </svg>
);

const GiftIcon = () => (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none">
        <rect x="20" y="35" width="60" height="40" rx="4" fill={BRAND.greenBright} stroke="black" strokeWidth="2.5" />
        <path d="M50 35V75M20 55H80" stroke="black" strokeWidth="2.5" />
        <path d="M50 35C50 35 40 20 25 20C15 20 15 30 25 30C35 30 50 35 50 35Z" stroke="black" strokeWidth="2.5" fill="none" />
        <path d="M50 35C50 35 60 20 75 20C85 20 85 30 75 30C65 30 50 35 50 35Z" stroke="black" strokeWidth="2.5" fill="none" />
    </svg>
);

const DuckIcon = () => (
    <svg width="80" height="70" viewBox="0 0 100 80" fill="none">
        <path d="M25 45C25 35 35 25 55 25C75 25 90 40 90 55C90 65 75 70 55 70C35 70 25 60 25 45Z" fill={BRAND.mustard} stroke="black" strokeWidth="2.5" />
        <path d="M55 25V15C55 10 65 5 75 10" stroke="black" strokeWidth="2.5" fill="none" />
        <circle cx="70" cy="35" r="2" fill="black" />
        <path d="M90 40L100 43L90 46" fill={BRAND.mustard} stroke="black" strokeWidth="2" />
    </svg>
);

const StickerCat = () => (
    <svg width="70" height="70" viewBox="0 0 100 100" className="drop-shadow-sm">
        <path d="M20 70 C 20 50, 40 35, 60 35 C 80 35, 90 50, 90 70" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <path d="M60 35 L 55 15 L 75 35 Z" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <path d="M30 45 L 20 15 L 45 40 Z" fill={BRAND.lila} stroke="black" strokeWidth="2.5" />
        <circle cx="45" cy="50" r="3" fill="black" />
        <circle cx="70" cy="50" r="3" fill="black" />
        <path d="M25 60 L 15 62" stroke="black" strokeWidth="2" />
        <path d="M25 65 L 15 68" stroke="black" strokeWidth="2" />
        <path d="M85 60 L 95 62" stroke="black" strokeWidth="2" />
        <path d="M85 65 L 95 68" stroke="black" strokeWidth="2" />
    </svg>
);

/**
 * NAVIGATION COMPONENTS
 */
const NavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'categories', label: 'Toy Shop', icon: Package },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
];

const BottomNav = ({ active, setView }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 px-2 z-50 md:hidden">
        {NavItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)} className="flex flex-col items-center gap-1.5">
                <item.icon size={26} strokeWidth={active === item.id ? 2.5 : 1.5} color={BRAND.font} />
                <span className="text-[12px] font-medium" style={{ color: BRAND.font }}>{item.label}</span>
            </button>
        ))}
    </div>
);

const DesktopSidebar = ({ active, setView }) => (
    <div className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white border-r p-8 z-50">
        <div className="mb-12 cursor-pointer" onClick={() => setView('home')}>
            <HeartHugLogo size={80} />
        </div>
        <nav className="flex flex-col gap-6">
            {NavItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className="flex items-center gap-4 group"
                >
                    <div className={`p-2 rounded-xl transition-all ${active === item.id ? 'bg-[#537D611A]' : 'group-hover:bg-gray-100'}`}>
                        <item.icon size={24} color={BRAND.green} strokeWidth={active === item.id ? 2.5 : 1.5} />
                    </div>
                    <span
                        className={`font-bold transition-all uppercase tracking-widest text-sm ${active === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
                        style={{ fontFamily: BRAND.headingFont }}
                    >
                        {item.label}
                    </span>
                </button>
            ))}
        </nav>
        <div className="mt-auto opacity-20">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: BRAND.headingFont }}>Wärme Schenken v1.0</p>
        </div>
    </div>
);

/**
 * SCREEN COMPONENTS
 */

const SplashScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <HeartHugLogo size={180} animated />
        <h1 className="mt-8 text-center" style={textStyle('h1')}>Wärme<br />schenken</h1>
    </div>
);

const SplitScreen = ({ setView }) => {
    return (
        <div className="flex flex-col items-center min-h-screen pt-12 px-8 pb-8 md:justify-center" style={{ backgroundColor: BRAND.beige }}>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <div className="mb-6 hidden md:block"><HeartHugLogo size={80} animated={false} /></div>
                    <div className="mb-6 opacity-90 md:hidden flex justify-center"><HeartHugLogo size={80} animated={false} /></div>
                    <h1 className="mb-4" style={textStyle('h1')}>Freude weitergeben</h1>
                    <p className="opacity-80 mb-8" style={textStyle('body')}>
                        Sharing joy made simple. With this app, you can donate toys or select them as a family affected by poverty.
                    </p>
                    <div className="hidden md:flex gap-4">
                        <button onClick={() => setView('intro')} className="px-12 py-4 rounded-full text-white transition-transform active:scale-95" style={{ ...textStyle('button'), backgroundColor: BRAND.green }}>FAMILY</button>
                        <button onClick={() => setView('intro')} className="px-12 py-4 rounded-full transition-transform active:scale-95" style={{ ...textStyle('button'), backgroundColor: BRAND.white, color: BRAND.green }}>DONOR</button>
                    </div>
                </div>

                <div className="relative w-full aspect-[4/5] rounded-3xl overflow-visible shadow-sm">
                    <div className="w-full h-full rounded-3xl overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-[-25px] left-[-30px] drop-shadow-lg z-10"><HelicopterIcon /></div>
                    <div className="absolute bottom-[-15px] right-[-15px] drop-shadow-lg z-10"><TeddyIcon /></div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 md:hidden">
                    <button onClick={() => setView('intro')} className="py-4 rounded-full text-white" style={{ ...textStyle('button'), backgroundColor: BRAND.green }}>FAMILY</button>
                    <button onClick={() => setView('intro')} className="py-4 rounded-full" style={{ ...textStyle('button'), backgroundColor: BRAND.white, color: BRAND.green }}>DONOR</button>
                </div>
            </div>
        </div>
    );
};

const IntroScreen = ({ setView }) => (
    <div className="flex flex-col items-center min-h-screen pt-12 px-8 pb-8 relative md:justify-center" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
                <div className="mb-4 flex justify-center"><HeartHugLogo size={80} animated={false} /></div>
                <h1 className="mb-10" style={textStyle('h1')}>What's next</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center mb-12">
                {[
                    { t: "1. Register or log in", b: "Sharing joy made simple. With this app, you can donate toys or select them as." },
                    { t: "2. Shop toys", b: "Sharing joy made simple. With this app, you can donate toys or select them as a family affected by poverty." },
                    { t: "3. Get it with post", b: "Sharing joy made simple. With this app, you can donate toys or select them as." }
                ].map((s, i) => (
                    <div key={i} className="bg-white/50 p-6 rounded-3xl md:bg-transparent md:p-0">
                        <h2 className="font-bold mb-2" style={{ fontFamily: BRAND.headingFont, fontSize: '20px', lineHeight: '24px' }}>{s.t}</h2>
                        <p className="opacity-70" style={{ fontFamily: BRAND.bodyFont, fontSize: '15px', lineHeight: '20px' }}>{s.b}</p>
                    </div>
                ))}
            </div>

            <div className="w-full max-w-sm mx-auto relative mt-2 md:max-w-none">
                <div className="absolute top-0 left-[-30px] md:left-20 drop-shadow-md rotate-[-5deg]"><CarIcon /></div>
                <div className="absolute top-[-30px] right-[-20px] md:right-20 drop-shadow-md rotate-[12deg]"><GiftIcon /></div>
                <div className="absolute bottom-[-10px] right-[-30px] md:bottom-20 md:right-1/4 drop-shadow-md md:hidden"><DuckIcon /></div>

                <div className="flex flex-col items-center gap-2 relative z-20 pt-16">
                    <button onClick={() => setView('reg')} className="w-full max-w-[220px] py-4 rounded-full text-white shadow-lg active:scale-95 transition-transform" style={{ backgroundColor: BRAND.green, ...textStyle('button') }}>JOIN NOW</button>
                    <button onClick={() => setView('split')} className="font-bold underline" style={{ color: BRAND.green, ...textStyle('button') }}>Back</button>
                </div>
            </div>
        </div>
    </div>
);

const RegistrationScreen = ({ setView, error = false }) => (
    <div className="min-h-screen pt-12 px-8 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-md w-full">
            <div className="flex gap-2 mb-12">
                <div className="h-1 flex-1 bg-green-800"></div>
                <div className="h-1 flex-1 bg-white"></div>
                <div className="h-1 flex-1 bg-white"></div>
            </div>
            <h1 className="mb-10 text-center md:text-left" style={textStyle('h1')}>Hello! You are...</h1>
            <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm space-y-8">
                {['Name', 'Nachname', 'E-Mail'].map((field, i) => {
                    const isErrorField = error && i === 2;
                    return (
                        <div key={field} className="space-y-1">
                            <div
                                className="border-b-2 pb-2"
                                style={{ borderColor: isErrorField ? BRAND.error : '#E5E7EB' }}
                            >
                                <label className="text-xs font-bold uppercase tracking-widest opacity-40 block mb-1">{field}</label>
                                <input
                                    type="text"
                                    defaultValue={i === 0 ? "Manuela" : i === 1 ? "Friedli" : error ? "beispielgmail.com" : "manuela-friedli@gmail.com"}
                                    className="w-full font-bold bg-transparent outline-none text-[17px]"
                                    style={{ color: BRAND.font }}
                                />
                            </div>
                            {isErrorField && (
                                <p className="text-[12px] mt-1 font-medium" style={{ color: BRAND.error }}>error lorem ipsum</p>
                            )}
                        </div>
                    );
                })}
                <div className="flex gap-4 items-start pt-2">
                    <div className="w-6 h-6 rounded-lg border-2 border-black flex items-center justify-center bg-black text-white shrink-0">✓</div>
                    <p className="text-[13px] leading-relaxed opacity-70">Accept our <span className="underline font-bold">Data Privacy</span>. By registering you accept our privacy statement.</p>
                </div>
            </div>
            <div className="mt-16 flex flex-col items-center gap-4">
                <button onClick={() => setView('upload')} className="w-full py-5 rounded-full text-white shadow-xl transition-transform active:scale-95" style={{ ...textStyle('button'), backgroundColor: BRAND.green }}>NEXT</button>
                <p className="text-[12px] font-medium opacity-60">Already have an account? <span className="underline font-bold text-green-800 cursor-pointer">Go to login</span></p>
            </div>
        </div>
    </div>
);

const ImageUploadScreen = ({ setView }) => (
    <div className="min-h-screen pt-12 px-8 flex flex-col items-center" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-md w-full">
            <div className="flex gap-2 mb-12">
                <div className="h-1 flex-1 bg-green-800 opacity-30"></div>
                <div className="h-1 flex-1 bg-green-800 opacity-30"></div>
                <div className="h-1 flex-1 bg-green-800"></div>
            </div>
            <h1 className="text-center mb-4" style={textStyle('h1')}>Share your social card</h1>
            <p className="text-center text-sm opacity-70 mb-10 px-4">Which organisation / institution has issued your evidence of a social organization?</p>
            <div className="bg-white rounded-[32px] p-8 shadow-sm">
                <button className="w-full py-4 px-6 rounded-full text-white flex justify-between items-center mb-8 shadow-lg" style={{ backgroundColor: BRAND.green, ...textStyle('button') }}>
                    <span className="text-sm">Choose organization</span>
                    <ChevronDown size={20} />
                </button>
                <div className="border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50 flex flex-col items-center justify-center py-16 px-6 text-center group cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-[#537D611A] flex items-center justify-center text-brand-green mb-4">
                        <UploadCloud size={32} color={BRAND.green} />
                    </div>
                    <p className="text-sm font-bold opacity-60 uppercase tracking-widest" style={{ fontFamily: BRAND.headingFont }}>Upload image</p>
                    <p className="text-[11px] opacity-40 mt-1">PNG, JPG up to 10MB</p>
                </div>
                <p className="text-[11px] text-center opacity-40 mt-8 leading-relaxed italic">We accept various social cards, find an overview here.</p>
            </div>
            <div className="mt-16 flex flex-col items-center gap-4">
                <button onClick={() => setView('home')} className="w-full py-5 rounded-full text-white opacity-40 shadow-xl" style={{ ...textStyle('button'), backgroundColor: '#999' }}>NEXT</button>
                <p className="text-[11px]">Already have an account? <span className="underline font-bold" style={{ color: BRAND.green }}>Go to login</span></p>
            </div>
        </div>
    </div>
);

const HomeScreen = ({ setView }) => (
    <div className="min-h-screen pt-8 px-6 pb-28 md:pb-8 md:pl-72 md:pr-12 md:pt-12 relative" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-[14px] font-bold tracking-[0.2em] opacity-80" style={{ fontFamily: BRAND.headingFont }}>NEWS</h2>
                <div className="relative"><StickerCat /></div>
            </div>

            <div className="bg-white rounded-[40px] p-10 md:p-14 shadow-sm mb-16 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-[40px] md:text-[56px] leading-tight mb-6" style={textStyle('h1')}>Noch 2 Tage</h1>
                    <p className="text-[18px] opacity-70 leading-relaxed" style={textStyle('body')}>Sharing joy made simple. With this app, you can donate toys or select them as a family affected by poverty.</p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -mr-20 -mt-20 opacity-50 md:opacity-100 transition-transform group-hover:scale-110"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <div>
                    <h2 className="text-[14px] font-bold tracking-[0.2em] opacity-80 mb-8 px-2 uppercase" style={{ fontFamily: BRAND.headingFont }}>Donation Overview</h2>
                    <div className="space-y-6">
                        <div className="bg-[#E8B870] rounded-[32px] p-6 pr-8 flex gap-6 min-h-[160px] shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="w-[120px] h-[120px] bg-white rounded-[24px] overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200" className="w-full h-full object-cover" /></div>
                            <div className="flex flex-col justify-between py-1 flex-grow">
                                <div><h3 className="font-bold text-[18px] leading-[1.2] mb-1">Book 1 long Name Lorem ipsum</h3><p className="text-[13px] opacity-90">Age: 6-9<br />Category: Book</p></div>
                                <div className="flex items-center gap-2 text-[14px] font-bold text-white mt-auto"><ThumbsUp size={20} fill="white" />Approved</div>
                            </div>
                        </div>
                        <div className="bg-[#A8ADED] rounded-[32px] p-6 pr-8 flex gap-6 min-h-[160px] relative shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="w-[120px] h-[120px] bg-white rounded-[24px] overflow-hidden shrink-0"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200" className="w-full h-full object-cover" /></div>
                            <div className="flex flex-col justify-between py-1 flex-grow">
                                <div><h3 className="font-bold text-[18px] leading-[1.2] mb-1">Book 2 Name Lorem</h3><p className="text-[13px] opacity-90">Age: 2-4<br />Category: Book</p></div>
                                <div className="flex items-center gap-2 text-[14px] font-bold text-white mt-auto"><CheckCircle size={20} fill="white" stroke="#A8ADED" />Selected</div>
                            </div>
                            <div className="absolute bottom-6 right-6"><div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center text-white"><Box size={24} /></div></div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-[14px] font-bold tracking-[0.2em] opacity-80 mb-8 px-2 uppercase" style={{ fontFamily: BRAND.headingFont }}>Facts</h2>
                    <div className="bg-[#335E52] rounded-[40px] p-12 relative overflow-visible h-full flex items-center">
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 scale-125"><GiftIcon /></div>
                        <div className="absolute -bottom-8 -left-2 z-10 rotate-[-15deg]"><DuckIcon /></div>
                        <div className="grid grid-cols-2 gap-12 text-white w-full">
                            <div className="text-center border-r border-white/10">
                                <h1 className="text-[48px] md:text-[64px] font-bold leading-none mb-3">1'572</h1>
                                <p className="text-[13px] opacity-80 mx-auto max-w-[140px]">Spielsachen wurden bereits gespendet:</p>
                            </div>
                            <div className="text-center">
                                <h1 className="text-[48px] md:text-[64px] font-bold leading-none mb-3">5020</h1>
                                <p className="text-[13px] opacity-80 mx-auto max-w-[140px]">So viel Geld wurde bereits gespendet.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <BottomNav active="home" setView={setView} />
    </div>
);

const ShopCategoriesScreen = ({ setView }) => (
    <div className="min-h-screen pt-12 px-6 pb-24 md:pl-72 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 mb-12">
                <div className="bg-white rounded-full flex-1 px-6 py-4 flex items-center gap-3 border border-black/5 shadow-sm">
                    <input placeholder="Search for toys..." className="bg-transparent w-full text-[16px] outline-none font-medium" />
                    <Search size={22} className="opacity-30" />
                </div>
                <button className="bg-white rounded-full px-8 py-4 border border-black/5 flex items-center gap-3 shadow-sm hover:bg-gray-50 transition-colors">
                    <span className="text-[16px] font-bold uppercase tracking-widest" style={{ fontFamily: BRAND.headingFont }}>Age</span>
                    <ChevronDown size={20} className="opacity-40" />
                </button>
            </div>

            <h1 className="mb-4" style={textStyle('h1')}>Our categories</h1>
            <p className="opacity-60 mb-12 text-[17px]" style={textStyle('body')}>Have fun browsing our shop, select up to 5 toys per family.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {['Books', 'Holz Wooden toys', 'Lego', 'Plush toy', 'Categorie 5', 'Categorie 6'].map((cat, i) => (
                    <div key={i} onClick={() => setView('products')} className="bg-white rounded-[32px] p-3 flex items-center gap-6 overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group">
                        <div className="w-24 h-24 bg-gray-100 rounded-[24px] overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                        <span className="flex-1 font-bold text-[18px]" style={{ fontFamily: BRAND.headingFont }}>{cat}</span>
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-[#537D611A] transition-colors">
                            <ChevronRight size={22} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <BottomNav active="categories" setView={setView} />
    </div>
);

const ShopProductsScreen = ({ setView }) => (
    <div className="min-h-screen pt-12 px-4 pb-24 md:pl-72 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <button onClick={() => setView('categories')} className="p-3 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
                        <ChevronLeft size={24} color={BRAND.green} />
                    </button>
                    <h1 className="font-bold text-[28px] uppercase tracking-[0.2em]" style={{ fontFamily: BRAND.headingFont }}>BOOKS</h1>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="bg-white h-14 flex-1 md:w-64 rounded-full shadow-sm flex items-center px-6 gap-3">
                        <Search size={22} className="opacity-20" />
                        <input placeholder="Search books..." className="bg-transparent w-full text-sm outline-none" />
                    </div>
                    <button className="bg-white h-14 px-8 rounded-full shadow-sm flex items-center gap-3 hover:bg-gray-50">
                        <span className="text-[14px] font-bold uppercase tracking-widest" style={{ fontFamily: BRAND.headingFont }}>Age</span>
                        <ChevronDown size={20} className="opacity-20" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                    const badgeColor = i % 3 === 0 ? BRAND.greenBright : i % 3 === 1 ? BRAND.lila : BRAND.mustard;
                    const badgeText = i % 3 === 0 ? 'neu' : i % 3 === 1 ? 'wie neu' : 'gebraucht';
                    return (
                        <div key={i} onClick={() => setView('detail')} className="bg-white rounded-[32px] p-3 pb-6 shadow-sm relative flex flex-col group cursor-pointer hover:shadow-xl transition-all">
                            <div className="relative w-full aspect-square rounded-[24px] overflow-hidden mb-4">
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold z-10 shadow-sm"
                                    style={{ backgroundColor: badgeColor }}>
                                    {badgeText}
                                </div>
                                <img src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="px-2 flex-grow">
                                <h3 className="font-bold text-[15px] leading-[1.3] mb-1 line-clamp-2" style={{ fontFamily: BRAND.headingFont }}>Superwissenschaftslabor von Cleme...</h3>
                                <p className="text-[12px] opacity-40 font-bold uppercase tracking-widest">Age: 2-4</p>
                            </div>
                            <div className="mt-4 flex justify-end px-2">
                                <div className="p-2 rounded-full bg-gray-50 group-hover:bg-[#537D61] group-hover:text-white transition-colors">
                                    <ShoppingCart size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        <BottomNav active="categories" setView={setView} />
    </div>
);

const DetailScreen = ({ setView }) => (
    <div className="min-h-screen pb-24 md:pl-72 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-6xl mx-auto">
            <div className="pt-8 px-6 flex items-center gap-4 mb-12">
                <button onClick={() => setView('products')} className="flex items-center gap-3 group">
                    <ChevronLeft size={24} color={BRAND.green} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-[0.2em] text-sm" style={{ color: BRAND.font, fontFamily: BRAND.headingFont }}>Back to shop</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 px-6 items-start">
                <div className="space-y-8">
                    <div className="relative rounded-[48px] overflow-hidden aspect-square bg-white shadow-2xl">
                        <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full text-[14px] font-bold shadow-lg z-10" style={{ backgroundColor: BRAND.mustard }}>gebraucht</div>
                        <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4].map(dot => <div key={dot} className={`w-3 h-3 rounded-full transition-all ${dot === 2 ? 'bg-green-800 scale-125' : 'bg-gray-300'}`} />)}
                    </div>
                </div>

                <div className="py-6">
                    <h1 className="text-[48px] leading-tight mb-4" style={textStyle('h1')}>Book 2 Name Lorem</h1>
                    <p className="text-[18px] opacity-40 font-bold uppercase tracking-widest mb-10">Age group: 1-3 years</p>

                    <div className="bg-white/40 p-8 rounded-[32px] mb-12">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-4" style={{ fontFamily: BRAND.headingFont }}>Description</h4>
                        <p className="text-[18px] leading-relaxed" style={textStyle('body')}>New plush toy, never used by our kids. Happy to find a new home and bring joy to another child.</p>
                    </div>

                    <button className="w-full py-6 rounded-full text-white flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl hover:shadow-2xl hover:-translate-y-1" style={{ ...textStyle('button'), backgroundColor: BRAND.green, fontSize: '18px' }}>
                        <ShoppingCart size={24} fill="white" /> ADD TO CART
                    </button>

                    <p className="text-center mt-6 text-[14px] opacity-40 font-medium">Free delivery within 2-4 business days</p>
                </div>
            </div>
        </div>
        <BottomNav active="categories" setView={setView} />
    </div>
);

const ProfileScreen = ({ setView }) => (
    <div className="min-h-screen pt-12 px-6 pb-24 md:pl-72 md:pr-12 md:pt-12" style={{ backgroundColor: BRAND.beige }}>
        <div className="max-w-4xl mx-auto">
            <h1 className="mb-12 text-[40px] md:text-[56px]" style={textStyle('h1')}>Hallo Manuela</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-30 mb-4" style={{ fontFamily: BRAND.headingFont }}>Your details</h3>
                        <p className="font-bold text-[20px] mb-1">Manuela Friedli</p>
                        <p className="font-medium text-[16px] opacity-60">manuela.friedli@gmail.com</p>
                    </div>
                    <User className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:scale-110 transition-transform" />
                </div>

                <div className="bg-white rounded-[32px] p-10 shadow-sm relative group">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] opacity-30 mb-4" style={{ fontFamily: BRAND.headingFont }}>Shipping Address</h3>
                    <p className="font-bold text-[20px] mb-1">Blattenstrasse 123</p>
                    <p className="font-bold text-[20px]">7456 Lettnau</p>
                    <p className="text-[14px] opacity-50 mt-6 leading-relaxed max-w-[200px]">Please keep your address updated, especially should you have moved.</p>
                    <button className="absolute top-10 right-10 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all" style={{ backgroundColor: BRAND.green }}><Edit2 size={22} /></button>
                </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm divide-y divide-gray-50 overflow-hidden">
                {['Mailings', 'Data Privacy', 'About Wärme Schenken', 'Delete profile'].map(item => (
                    <div key={item} className="p-8 flex justify-between items-center font-bold text-[18px] cursor-pointer hover:bg-gray-50 transition-colors group">
                        <span style={{ fontFamily: BRAND.headingFont }} className="uppercase tracking-widest opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all">{item}</span>
                        <ChevronRight size={24} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
        <BottomNav active="profile" setView={setView} />
    </div>
);

/**
 * MAIN APP CONTROLLER
 */
export default function App() {
    const [view, setView] = useState('splash');

    // Handle splash transition
    React.useEffect(() => {
        if (view === 'splash') {
            const timer = setTimeout(() => setView('split'), 2500);
            return () => clearTimeout(timer);
        }
    }, [view]);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans overflow-x-hidden">
            {/* SIDEBAR FOR DESKTOP */}
            {view !== 'splash' && view !== 'split' && view !== 'intro' && view !== 'reg' && view !== 'upload' && (
                <DesktopSidebar active={view} setView={setView} />
            )}

            {/* MAIN CONTENT AREA */}
            <div className={`flex-grow transition-all duration-500`}>
                {view === 'splash' && <SplashScreen />}
                {view === 'split' && <SplitScreen setView={setView} />}
                {view === 'intro' && <IntroScreen setView={setView} />}
                {view === 'reg' && <RegistrationScreen setView={setView} />}
                {view === 'error' && <RegistrationScreen setView={setView} error />}
                {view === 'upload' && <ImageUploadScreen setView={setView} />}
                {view === 'home' && <HomeScreen setView={setView} />}
                {view === 'categories' && <ShopCategoriesScreen setView={setView} />}
                {view === 'products' && <ShopProductsScreen setView={setView} />}
                {view === 'detail' && <DetailScreen setView={setView} />}
                {view === 'profile' && <ProfileScreen setView={setView} />}
            </div>
        </div>
    );
}