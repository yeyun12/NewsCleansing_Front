import React from "react";

import { BaseButton } from "../../../../components/Button";

const CategoryButton = ({

    onClick,

}) => {
    return (
        <BaseButton className="category-btn" onClick={onClick}>

            📁 뉴스 카테고리

        </BaseButton>
    );
};

export default CategoryButton;