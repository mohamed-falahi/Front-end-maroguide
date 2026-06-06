import { TRAVELERS, TRENDING } from "../constants/mockData";

export function Sidebar() {
    return (
        <div className="side-col">
            <div className="side-card">
                <div className="side-title">Suggested Travelers</div>
                {TRAVELERS.map(t => (
                    <div key={t.name} className="traveler-item">
                        <div className="avatar">👤</div>
                        <div className="traveler-info">
                            <div className="traveler-name">{t.name}</div>
                            <div className="traveler-role">{t.role}</div>
                        </div>
                        <button className="follow-btn">Follow</button>
                    </div>
                ))}
                <span className="view-more-link">View More Travelers</span>
            </div>

            <div className="side-card">
                <div className="side-title">Trending Destinations</div>
                <div className="dest-main">
                    <img src={TRENDING[0].img} alt={TRENDING[0].name} />
                    <div className="dest-overlay">
                        <div className="dest-name">{TRENDING[0].name}</div>
                        <div className="dest-trips">{TRENDING[0].trips}</div>
                    </div>
                </div>
                <div className="dest-grid">
                    {TRENDING.slice(1).map(d => (
                        <div key={d.name} className="dest-small">
                            <img src={d.img} alt={d.name} />
                            <div className="dest-overlay">
                                <div className="dest-name">{d.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}