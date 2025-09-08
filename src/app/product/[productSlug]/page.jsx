import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import React from 'react';

const page = async ({ params }) => {
    const { productSlug } = await params;
    
    return (
        <div>
            <Header />

            <ProductDetails productSlug={productSlug} />

            <Footer />
        </div>
    );
};

export default page;