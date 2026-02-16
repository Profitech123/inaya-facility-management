import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BeforeAfterSlider = ({
    beforeImage,
    afterImage,
    title = "See the Difference",
    description = "Drag the slider to see our professional cleaning results."
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [position, setPosition] = useState(50);
    const containerRef = useRef(null);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);

    const handleMove = useCallback((clientX) => {
        if (!containerRef.current) return;

        const { left, width } = containerRef.current.getBoundingClientRect();
        const x = clientX - left;
        const newPos = Math.min(Math.max((x / width) * 100, 0), 100);

        setPosition(newPos);
    }, []);

    const handleMouseMove = useCallback((e) => {
        if (!isResizing) return;
        handleMove(e.clientX);
    }, [isResizing, handleMove]);

    const handleTouchMove = useCallback((e) => {
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    // Handle outside release
    useEffect(() => {
        const handleGlobalMouseUp = () => setIsResizing(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6">

                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl select-none group">

                    {/* After Image (Background) */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${afterImage})` }}
                    />
                    <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide z-10 shadow-sm">
                        After
                    </div>

                    {/* Before Image (Foreground - Clipped) */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${beforeImage})`,
                            clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`
                        }}
                    />
                    <div
                        className="absolute top-6 left-6 bg-slate-900 text-white px-4 py-1.5 rounded-full text-sm font-bold tracking-wide z-10 shadow-sm"
                        style={{ opacity: position > 10 ? 1 : 0, transition: 'opacity 0.2s' }}
                    >
                        Before
                    </div>

                    {/* Slider Handle */}
                    <div
                        ref={containerRef}
                        className="absolute inset-0"
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onTouchMove={handleTouchMove}
                    >
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20"
                            style={{ left: `${position}%` }}
                        >
                            <div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 cursor-ew-resize transition-transform hover:scale-110"
                            >
                                <div className="flex gap-0.5">
                                    <ChevronLeft className="w-4 h-4" />
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 font-display">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {description}
                    </p>
                </div>

            </div>
        </section>
    );
};

export default BeforeAfterSlider;
