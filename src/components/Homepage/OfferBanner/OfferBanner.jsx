'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { offerBannerAPI } from '@/services/api'
import Link from 'next/link'

export default function OfferBanner() {
    const [banner, setBanner] = useState(null)

    // Fake data for single offer banner - will be replaced with API call
    const fakeBanner = {
        id: 1,
        title: "50% Discount",
        subtitle: "Only for the first order",
        promoCode: "PINKFAST50",
        description: "Use promo code",
        image: "/images/offer-banner.png",
        backgroundColor: "#fce7f3",
        textColor: "#000000",
        promoCodeColor: "#ec4899",
        isActive: true,
        isRedirect: true,
        redirectUrl: "http://forpink.com",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        priority: 1
    }

    useEffect(() => {
        fetchBanner()
    }, [])

    const fetchBanner = async () => {
        try {
            // Try to fetch from API first
            const response = await offerBannerAPI.getActiveBanners()
            if (response.success && response.data.length > 0) {
                // Get the first active banner (highest priority)
                setBanner(response.data[0])
            } else {
                // Fallback to fake data if API fails or no data
                setBanner(fakeBanner)
            }
        } catch (error) {
            console.error('Error fetching banner:', error)
            // Fallback to fake data on error
            setBanner(fakeBanner)
        }
    }



    if (!banner) {
        return null
    }

    return (
        <section className=" px-4 bg-white">
            <div className="2xl:max-w-7xl xl:max-w-6xl lg:xl:2xl:max-w-7xl xl:max-w-6xl   max-w-xl xl:2xl:max-w-7xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
                {/* <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Special Offers
                    </h2>
                    <p className="text-lg text-gray-600">
                        Don't miss out on these amazing deals
                    </p>
                </div> */}



                {
                    banner?.redirectUrl && banner?.isRedirect ?
                        <Link href={banner.redirectUrl} >
                            <div className="relative overflow-hidden ">
                                <div
                                    className="flex flex-col lg:flex-row items-center min-h-[400px]"
                                    style={{ backgroundColor: banner.backgroundColor }}
                                >
                                    {/* Left Side - Image */}
                                    <div className="w-full lg:w-1/2 relative h-[300px] lg:h-[400px]">
                                        <Image
                                            src={banner.image}
                                            alt={banner.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>

                                    {/* Right Side - Content */}
                                    <div className="w-full lg:w-1/2 p-6 lg:p-12">
                                        <div className="max-w-md mx-auto lg:mx-0">
                                            <p className="text-sm lg:text-base mb-2" style={{ color: banner.promoCodeColor }}>
                                                {banner.subtitle}
                                            </p>

                                            <h3 className="text-2xl lg:text-4xl font-bold mb-4" style={{ color: banner.textColor }}>
                                                {banner.title}
                                            </h3>

                                            <p className="text-base lg:text-lg mb-6" style={{ color: banner.textColor }}>
                                                {banner.description}
                                            </p>

                                            <div className="py-4">
                                                <p
                                                    className="text-xl lg:text-2xl font-bold"
                                                    style={{ color: banner.promoCodeColor }}
                                                >
                                                    {banner.promoCode}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link> :
                        <div>
                            <div className="relative overflow-hidden ">
                                <div
                                    className="flex flex-col lg:flex-row items-center min-h-[400px]"
                                    style={{ backgroundColor: banner.backgroundColor }}
                                >
                                    {/* Left Side - Image */}
                                    <div className="w-full lg:w-1/2 relative h-[300px] lg:h-[400px]">
                                        <Image
                                            src={banner.image}
                                            alt={banner.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>

                                    {/* Right Side - Content */}
                                    <div className="w-full lg:w-1/2 p-6 lg:p-12">
                                        <div className="max-w-md mx-auto lg:mx-0">
                                            <p className="text-sm lg:text-base mb-2" style={{ color: banner.promoCodeColor }}>
                                                {banner.subtitle}
                                            </p>

                                            <h3 className="text-2xl lg:text-4xl font-bold mb-4" style={{ color: banner.textColor }}>
                                                {banner.title}
                                            </h3>

                                            <p className="text-base lg:text-lg mb-6" style={{ color: banner.textColor }}>
                                                {banner.description}
                                            </p>

                                            <div className="py-4">
                                                <p
                                                    className="text-xl lg:text-2xl font-bold"
                                                    style={{ color: banner.promoCodeColor }}
                                                >
                                                    {banner.promoCode}
                                                </p>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                }


            </div>
        </section >
    )
}
