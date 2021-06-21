const axios = require("axios");
const constants = require("./constants");

let URL = constants.URL;
let districts = constants.DISTRICTS;

exports.checkCowin = async () => {
	let date = new Date();
	let formattedDate =
		date.getDate() + "-" + (date.getMonth()+1) + "-" + date.getFullYear();

	let finalPayload = [];

	for (district of districts) {
		console.log("Checking for " + district.districtName);

		let config = {
			method: "get",
			url:
				URL +
				"?district_id=" +
				district.districtId +
				"&date=" +
				formattedDate,
			headers: {
				accept: "application/json",
				"Accept-Language": "en_US",
                "User-Agent": "Mozilla/5.0",
			},
		};

		try {
			let payload = await checkDistrict(config);

			if (payload.success === false) {
				continue;
			}

			payload.data.forEach((center) => {
				console.log(center);
				let message = "################# \n";
				message +=
					center.name +
					", " +
					center.address +
					", " +
					center.district +
					" - " +
					center.pincode +
					" (" +
					center.fee_type +
					")\n\n";
				message += "Next Session : \n";
				center.sessions.forEach(session => {
					message +=
						session.date +
						", " +
						session.vaccine +
						", " +
						session.min_age_limit +
						"+, capacity : " +
						session.available_capacity +
						"\n\n";
					message += "Slots : \n";
					session.slots.forEach((slot) => {
						message += slot + "\n";
					});
					message += "\n\n";
				})
				message += " #################";
				finalPayload.push(message);
			});
		} catch (err) {
			console.log(err);
			Promise.reject(err);
		}
	}

	return finalPayload;
};

checkDistrict = async (config) => {
	let res;
	try {
		res = await axios(config);
	} catch (err) {
		console.error(err);
		Promise.reject(err);
	}

	if (res.data.centers === "undefined") {
		return {
			success: false,
			data: [],
		};
	}

	let payload = [];

	console.log("Found " + res.data.centers.length + " potential centers");

	res.data.centers.forEach((center) => {
		console.log("Checking for " + center.name);

		let centerSessionPayload = [];

		center.sessions.forEach((session) => {
			if (session.available_capacity > 0) {
				centerSessionPayload.push(session);
				console.log(
					"Found " +
						session.available_capacity +
						" capacity for date : " +
						session.date
				);
			}
		});

		console.log(
			"Final count of sessions with available slots : " +
				centerSessionPayload.length
		);

		if (centerSessionPayload.length > 0) {
			payload.push({
				name: center.name,
				address: center.address,
				district: center.district_name,
				fee_type: center.fee_type,
				pincode: center.pincode,
				sessions: centerSessionPayload,
			});
		}
	});

	console.log(
		"Final count of centers with available slots : " + payload.length
	);

	return {
		success: true,
		data: payload,
	};
};
