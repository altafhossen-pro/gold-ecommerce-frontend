import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import React from 'react';

const page = ({ params }) => {
    return (
        <div>
            <Header />

            <ProductDetails productSlug={params.productSlug} />

            <Footer />
        </div>
    );
};

export default page;