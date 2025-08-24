'use client';

import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';


// Testimonial data
const testimonials = [
    {
        id: 1,
        name: "Frank ko",
        role: "SEO Forpink.com",
        rating: 4.5,
        image: "/images/featured/img.png",
        text: "From packaging to product quality—everything was top-notch! The rings were perfectly sized and added elegance to my wedding outfit."
    },
    {
        id: 2,
        name: "Sarah Johnson",
        role: "Fashion Blogger",
        rating: 4.5,
        image: "/images/featured/img1.png",
        text: "Amazing quality and beautiful designs. The jewelry exceeded my expectations and received so many compliments!"
    },
    {
        id: 3,
        name: "Michael Chen",
        role: "Wedding Planner",
        rating: 4.5,
        image: "/images/featured/img.png",
        text: "Perfect for special occasions. The craftsmanship is outstanding and the customer service was exceptional."
    },
    {
        id: 4,
        name: "Emily Davis",
        role: "Style Consultant",
        rating: 4.5,
        image: "/images/featured/img1.png",
        text: "Absolutely love the collection! The pieces are elegant, well-made, and perfect for any occasion."
    },
    {
        id: 5,
        name: "David Wilson",
        role: "Event Coordinator",
        rating: 4.5,
        image: "/images/featured/img.png",
        text: "Outstanding quality and beautiful designs. Highly recommend for anyone looking for premium jewelry."
    }
];

function TestimonialCard({ testimonial }) {
    return (
        <div className="bg-white border border-[#E7E7E7] rounded-xl shadow-lg p-6 h-full">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-4 border-b border-[#E7E7E7] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{testimonial.name}</h3>
                        <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-800">{testimonial.rating}</span>
                </div>
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-600 text-sm leading-relaxed min-h-[91px]">
                {testimonial.text}
            </p>
        </div>
    );
}

export default function CustomerTestimonial() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <section className="py-12 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer Testimonial</h2>
                    <p className="text-gray-600 text-base max-w-xl mx-auto">
                        Real stories. Genuine smiles. Discover how our jewelry made their moments unforgettable.
                    </p>
                </div>

                {/* Testimonials Carousel */}
                <Swiper
                    modules={[Pagination]}
                    spaceBetween={24}
                    slidesPerView={1}
                    loop={true}
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
                        <SwiperSlide key={testimonial.id}>
                            <TestimonialCard testimonial={testimonial} />
                        </SwiperSlide>
                    ))}
                </Swiper>

                


            </div>
        </section>
    );
}
