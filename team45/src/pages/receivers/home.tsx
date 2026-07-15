import { Link } from "react-router-dom";

import heroImage from "../../assets/img/foodrescue3.jpeg";
import eligibilityBg from "../../assets/img/pexels-rdne-6646917.jpg";

const howItWorksSteps = [
	{
		number: 1,
		title: "Register your organization",
		description: "Complete our verification process ",
	},
	{
		number: 2,
		title: "Browse available food",
		description: "View real-time listing of surplus food",
	},
	{
		number: 3,
		title: "Claim donations",
		description: "Reserve food that meets your needs",
	},
	{
		number: 4,
		title: "Receive & Distribute",
		description: "Collect your donation",
	},
];

const benefits = [
	{
		icon: "bi bi-egg-fill",
		title: "Access to Quality Food",
		description: "Receive fresh food",
	},
	{
		icon: "bi bi-floppy",
		title: "Reduce Cost",
		description: "Lower your food acquisition",
	},
	{
		icon: "bi bi-people",
		title: "Community Impact",
		description: "Make a real difference",
	},
	{
		icon: "bi bi-speedometer2",
		title: "Simple Process",
		description: "Our platform makes requesting",
	},
];

const eligibilityCategories = [
	{
		title: "Registered NGOs",
		points: "",
	},
	{
		title: "Community Kitchens",
		points: "",
	},
	{
		title: "Qualified Individuals",
		points: "",
	},
];

const ReceiverHome = () => {
	return (
		<>
			<section className="hero">
				<div className="container">
					<div className="hero-content">
						<h1>Get Access to Surplus Food for Your Community</h1>
						<p>
							Rescue produce connects NGOs, community kitchens,
							and qualified individuals with surplus food from
							supermarkets and restaurants.
						</p>
						<a
							href="../authpages/signup.html"
							className="btn btn-primary btn-large">
							Register as Food Receiver
						</a>
					</div>
					<div className="hero-image">
						<img
							src="../assets/img/foodrescue3.jpeg"
							alt="Community receiving food"
						/>
					</div>
				</div>
			</section>
			<section className="how-it-works">
				<div className="container">
					<h2>How It Works for Food Receivers</h2>
					<div className="steps">
						<div className="step">
							<div className="step-number">1</div>
							<h3>Register Your Organization</h3>
							<p>
								Complete our verification process to ensure you
								qualify to receive food donations.
							</p>
						</div>
						<div className="step">
							<div className="step-number">2</div>
							<h3>Browse Available Food</h3>
							<p>
								View real-time listings of surplus food from
								local supermarkets and restaurants.
							</p>
						</div>
						<div className="step">
							<div className="step-number">3</div>
							<h3>Claim Donations</h3>
							<p>
								Reserve food that meets your needs and schedule
								pickup or delivery.
							</p>
						</div>
						<div className="step">
							<div className="step-number">4</div>
							<h3>Receive &amp; Distribute</h3>
							<p>
								Collect your donation and distribute it to those
								in need in your community.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section className="benefits">
				<div className="container">
					<h2>Benefits for Food Receivers</h2>
					<div className="benefits-grid">
						<div className="benefit-card">
							<img src="icon-food.png" alt="Food icon" />
							<h3>Access to Quality Food</h3>
							<p>
								Receive fresh, nutritious food that would
								otherwise go to waste.
							</p>
						</div>
						<div className="benefit-card">
							<img src="icon-save.png" alt="Save money icon" />
							<h3>Reduce Costs</h3>
							<p>
								Lower your food acquisition costs while serving
								more people.
							</p>
						</div>
						<div className="benefit-card">
							<img
								src="icon-community.png"
								alt="Community icon"
							/>
							<h3>Community Impact</h3>
							<p>
								Make a real difference in fighting hunger in
								your area.
							</p>
						</div>
						<div className="benefit-card">
							<img src="icon-easy.png" alt="Easy icon" />
							<h3>Simple Process</h3>
							<p>
								Our platform makes requesting and receiving food
								straightforward.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section
				className="eligibility image-bg-section"
				style={{
					backgroundImage:
						'url("assets/img/pexels-rdne-6646917.jpg")',
				}}>
				<div className="container">
					<h2>Who Can Receive Food?</h2>
					<p>
						We work with registered NGOs, community kitchens,
						shelters, and other organizations that distribute food
						to those in need. Individuals experiencing food
						insecurity may also qualify through partner
						organizations.
					</p>
					<div className="eligibility-cards">
						<div className="eligibility-card">
							<h3>Registered NGOs</h3>
							<ul>
								<li>Valid registration certificate</li>
								<li>Proof of food distribution activities</li>
								<li>Storage capacity for received food</li>
							</ul>
						</div>
						<div className="eligibility-card">
							<h3>Community Kitchens</h3>
							<ul>
								<li>Proof of operation</li>
								<li>Health and safety compliance</li>
								<li>Regular meal service schedule</li>
							</ul>
						</div>
						<div className="eligibility-card">
							<h3>Qualified Individuals</h3>
							<ul>
								<li>Referral from partner organization</li>
								<li>Proof of need</li>
								<li>Limited to certain food types</li>
							</ul>
						</div>
					</div>
				</div>
			</section>
			<section className="cta-section">
				<div className="container">
					<h2>Ready to Start Receiving Food?</h2>
					<p>
						Join our network of food receivers and help reduce waste
						while fighting hunger in your community.
					</p>
					<div className="cta-buttons">
						<a
							href="../authpages/signup.html"
							className="btn btn-primary btn-large">
							Register Now
						</a>
						<a
							href="../authpages/signin.html"
							className="btn btn-secondary btn-large">
							Log In to Your Account
						</a>
					</div>
				</div>
			</section>
		</>
	);
};

export default ReceiverHome;
