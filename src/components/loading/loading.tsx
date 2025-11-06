// components/loading/LoadingSpinner.tsx
"use client";

export function LoadingSpinner() {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cover bg-center"

        >
            {/* Overlay: tối nhẹ + mờ kính để nổi bật nội dung */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

            {/* Nội dung loading - nằm trên overlay */}
            <div className="relative z-10 flex flex-col items-center gap-8 animate-pulse">
                {/* Hình GIF loading */}
                <div className="animate-bounce">
                    <img
                        src="public/image/unnamed_wipe_bg (1).png"
                        alt="Loading animation"
                        className="w-48 h-48 object-contain drop-shadow-2xl"
                    />
                </div>

                {/* 3 chấm nhảy */}
                <div className="flex gap-3">
                    <div
                        className="w-4 h-4 bg-white/90 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                    ></div>
                    <div
                        className="w-4 h-4 bg-white/90 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                        className="w-4 h-4 bg-white/90 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                    ></div>
                </div>

                {/* Text loading */}
                <p className="text-white text-lg font-medium tracking-wider drop-shadow-lg">
                    Đang tải <span className="text-yellow-300 font-bold">MaritimeHub</span>...
                </p>
            </div>
        </div>
    );
}