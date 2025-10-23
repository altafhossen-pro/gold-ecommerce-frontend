'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { testimonialAPI } from '@/services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

function TestimonialCard({ testimonial }) {
    const renderStars = (rating) => {
        return Array.from({ length: 1 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${
                    index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <div className="bg-white border border-[#E7E7E7] rounded-xl shadow-lg p-6 h-full">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-4 border-b border-[#E7E7E7] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                            src={testimonial.profilePic}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{testimonial.name}</h3>
                        {testimonial.designation && (
                            <p className="text-gray-500 text-xs">{testimonial.designation}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {renderStars(testimonial.rating)}
                    <span className="text-sm font-medium text-gray-800 ml-1">{testimonial.rating}/5</span>
                </div>
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-600 text-sm leading-relaxed min-h-[91px]">
                {testimonial.reviewText}
            </p>
        </div>
    );
}

export default function CustomerTestimonial() {
    const [mounted, setMounted] = useState(false);
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await testimonialAPI.getActiveTestimonials();
            
            if (response.success) {
                setTestimonials(response.data.testimonials);
            } else {
                console.error('Failed to fetch testimonials:', response.message);
                // Fallback to empty array if API fails
                setTestimonials([]);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            // Fallback to empty array if API fails
            setTestimonials([]);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) return null;

    // Don't render if no testimonials
    if (!loading && testimonials.length === 0) {
        return null;
    }
    return (
        <section className="py-12 px-4 bg-white">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer Testimonial</h2>
                    <p className="text-gray-600 text-base max-w-xl mx-auto">
                        Real stories. Genuine smiles. Discover how our jewelry made their moments unforgettable.
                    </p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    /* Testimonials Carousel */
                    <Swiper
                        modules={[Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        loop={testimonials.length > 1}
                        pagination={{
                            clickable: true,
                            el: '.testimonial-pagination',
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 2,
                            },
                            768: {
                                slidesPerView: 3,
                            },
                            1024: {
                                slidesPerView: 4,
                            },
                        }}
                        className="testimonial-swiper !pb-4 !px-1"
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial._id}>
                                <TestimonialCard testimonial={testimonial} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}

                


            </div>
        </section>
    );
}
