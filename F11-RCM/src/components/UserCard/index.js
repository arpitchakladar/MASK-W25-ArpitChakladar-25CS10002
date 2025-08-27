import "./styles.css";

function UserCard({ avatar, title, icon }) {
	return (
		<div className="UserCard">
			<div>
				<img className="avatar" src={avatar} alt="username" />
				<div className="title">{title}</div>
				<img className="icon" src={icon} alt="icon" />
			</div>
		</div>
	);
}

export default UserCard;
