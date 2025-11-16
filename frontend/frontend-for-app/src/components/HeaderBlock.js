import "./HeaderBlock.css"

const HeaderBlock = () => {
  return (
    <div className="headerBlock">
      <div className="headerBlock-container">

        <div className="headerBlock-container-name">
          <h1>Симулятор собеседований</h1>
        </div>

        <div className="headerBlock-container-profile">
          <button className="profile-button">Профиль</button>
        </div>

      </div>
    </div>
  );
}

export default HeaderBlock;