const Header = () => {
    return (
        <div className="header">
            <div className="header__wrapper">
                <div className="header__logo">
                    <a className="header__logo-link" href="/">
                        <img className="header__logo-img" src="src/assets/images/nurgameLogo.png" alt="logo"/>
                    </a>
                </div>
                <div className="header__navigation">
                    <div className="header__navigation-list">
                        <div className="header__navigation-item">
                            <a className="header__navigation-link" href="/">
                                <img className="header__navigation-img" src="src/assets/images/homeLogo.svg"
                                     alt="Home Icon"/>
                                <p className="header__navigation-text">Home</p>
                            </a>
                        </div>
                        <div className="header__navigation-item">
                            <a className="header__navigation-link" href="/courses">
                                <img className="header__navigation-img" src="src/assets/images/coursesLogo.svg"
                                     alt="Courses Icon"/>
                                <p className="header__navigation-text">Courses</p>
                            </a>
                        </div>
                        <div className="header__navigation-item">
                            <a className="header__navigation-link" href="/message">
                                <img className="header__navigation-img" src="src/assets/images/messagesLogo.svg"
                                     alt="Message Icon"/>
                                <p className="header__navigation-text">Message</p>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="header__support">
                    <div className="header__support-container">
                        <a className="header__support-link" href="/support">
                            <div className="header__support-item">
                                <h1 className="header__support-mainText">Support 24/7</h1>
                                <p className="header__support-text">Contacts us anytime</p>
                            </div>
                            <div className="header__support-item">
                                <img className="header__support-img" src="src/assets/images/supportLogo.svg"
                                     alt="Support Icon"/>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;