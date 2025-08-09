import React, { useState } from "react";

/* 
- useNavigate 라이브러리 사용을 위해 'npm install react-router-dom' 터미널에 입력해야함.
- useNavigate : 페이지 이동을 위한 함수, 쉽게 말하면 페이지 이동을 위한 네비게이션 같은 역할이라고 생각하면 됨.
*/
import { useNavigate } from "react-router-dom";



import MainPresenter from "./MainPresenter";

/* 
    하나의 페이지를 Container와 Presenter로 분리, 역할은 아래 참고
    * Container: 백엔드에서 데이터를 불러와 state 관리, 로직을 담당하는 함수 선언 -> 기능적인 부분 담당
    * Presenter: 불러온 데이터를 토대로 페이지에 출력, 함수 사용 -> UI 적인 부분 담당
*/

const MainContainer = () => {

    const navigate = useNavigate();

    /* 
    - useState() == 렌더링될 때 데이터가 변경될 수 있도록 상태 관리하는 함수임. 저장, 관리 등
    - ex: 아래 count, setCount 변수 참고
        - useState(0)으로 할당되어 있는데 페이지에서 버튼을 누르면 숫자가 증가하는 느낌. 이해함? 모르겠으면 GPT 보단 구글에 검색 ㄱㄱ
        - count == 현재 상태의 값, setCount == 현재 상태의 값을 업데이트하는 함수
        - useState(0)이라고 선언을 했으니 현재 'count' 의 값은 0임.

    */
    const [count, setCount] = useState(0);

    // 버튼 클릭 시 count를 1씩 증가하는 함수 생성.
    const buttonClick = async() => {
        setCount(count + 1);
    }

    return (
    /*
    - Container는 Presenter만 반환
    
    - Container에서 선언한 함수를 Presenter에게 props로 넘겨주어 사용
    */
        <MainPresenter 

            count={count}
            buttonClick={buttonClick}
            /* 
            - Presenter로 count랑 buttonClick을 props로 넘겨줘서 값을 전달
            ** props : 부모의 값을 자식에게 값을 넘겨준다 라는 느낌인데, 쉽게 설명하면 count라는 값을 presenter로 넘겨주겠다라는 말임.
            모르겠으면 구글에 검색 ㄱㄱ
            */
        />

    )
}


export default MainContainer;