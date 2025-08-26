import React from "react";

import { BaseButton } from "../../../../components/Button";

const MindfulnessButton = ({

    onClick

}) => {
    return (
        <BaseButton className="mindfulness-btn" onClick={onClick}>

            😊 스트레스 관리
        </BaseButton>
    )
}

export default MindfulnessButton;