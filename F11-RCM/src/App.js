import "./App.css";
import UserCardComponent from "./components/UserCard";

const members = [
	{
		avatar: "https://kgpmask.club/assets/members/22_aman.webp",
		title: "Aman Tater",
		icon: "https://kgpmask.club/assets/icons/newsletter.svg"
	},
	{
		avatar: "https://kgpmask.club/assets/members/22_dishant.webp",
		title: "Distant Brotha",
		icon: "https://kgpmask.club/assets/icons/quiz.svg"
	},
	{
		avatar: "https://kgpmask.club/assets/members/22_sahil.webp",
		title: "Sahil Patel",
		icon: "https://kgpmask.club/assets/icons/design.svg"
	},
	{
		avatar: "https://kgpmask.club/assets/members/22_soumil.webp",
		title: "Soumil Maiti",
		icon: "https://kgpmask.club/assets/icons/quiz.svg"
	},
];

function App() {
	return (
		<div className="App">
			<header className="App-header">
				<div className="background" />
				<img src="https://kgpmask.club/assets/logo.jpeg" alt="MASK"/>
			</header>
			<section className="members">
				{members.map((member) => (
					<UserCardComponent
						{...member}
					/>
				))}
			</section>
		</div>
	);
}

export default App;
