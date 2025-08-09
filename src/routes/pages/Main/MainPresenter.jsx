import React from "react";

import './Main.css';

/*
    ※ 컴포넌트 이름(함수 이름)은 무조건 대문자로 시작해야 함 ※
    만약 소문자로 시작한다면 컴포넌트를 출력할 수 없으므로 반드시 주의해서 작성할 것
*/

const MainPresenter = ({

    // MainContainer.js 에서 넘겨준 count, buttonClick props를 여기서 같은 이름으로 선언해야함. 그래야 헷갈리지 않음.
    count,
    buttonClick,

}) => {
    return (
        <div className="main-presenter">
            <p>{count}</p>
            <button onClick={buttonClick}> 숫자 증가 </button>
        </div>
    )
}

export default MainPresenter;