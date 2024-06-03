const perform = async (z, bundle) => {
	imagetobeTransformed = "";
	if (bundle.inputData.url.includes("https://cdn.pixelbinz0.de")) {
		imagetobeTransformed = bundle.inputData.url;
	} else {
		try {
			const response = await z.request({
				url: `https://api.pixelbinz0.de/service/platform/assets/v1.0/upload/url`,
				method: "POST",
				headers: {
					accept: "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					url: bundle.inputData.url,
					path: "/__zapier_Transfomation",
					tags: bundle.inputData.tags,
					access: "public-read",
					metadata: {},
					overwrite: true,
					filenameOverride: true,
				}),
			});
			imagetobeTransformed = response.data.url;
		} catch (error) {
			throw new Error(`FAILED to upload image: ${error}`);
		}
	}

	let replacement = "sr.upscale(";
	if (bundle.inputData.t) replacement += `t:${bundle.inputData.t},`;
	if (bundle.inputData.enhance_face)
		replacement += `enhance_face:${bundle.inputData.enhance_face},`;
	if (bundle.inputData.model) replacement += `model:${bundle.inputData.model},`;
	if (bundle.inputData.enhance_quality)
		replacement += `enhance_quality:${bundle.inputData.enhance_quality},`;

	replacement += ")";

	imagetobeTransformed = imagetobeTransformed.replace("original", replacement);
	testImageUrl = {
		url: imagetobeTransformed,
		method: "GET",
	};

	let retries = 5;

	async function getStatus() {
		retries -= 1;
		const response = await z.request(testImageUrl);

		try {
			statusCode = response.status;

			if (statusCode === 200) {
				return { url: imagetobeTransformed };
			}
			if (statusCode === 202) {
				setTimeout(() => {
					getStatus();
				}, 5000);
			} else throw reponse;
		} catch (error) {
			throw error;
		}
	}

	return getStatus();
	// end
};

module.exports = {
	key: "transform",
	noun: "transform",

	display: {
		label: "Upscale Images",
		description: "Transforms Image using Pixelbin.io",
	},

	operation: {
		perform,
		inputFields: [
			{
				key: "url",
				required: true,
				type: "string",
				label: "Image/url",
				helpText: "Image to be transformed.(upto resolution 1,500 x 1,500 px)",
			},
			{
				key: "t",
				label: "Type",
				required: false,
				choices: ["2x", "4x", "8x"],
				type: "string",
			},
			{
				key: "enhance_face",
				label: "Enahnace Face",
				required: false,
				type: "boolean",
			},

			{
				key: "model",
				label: "Model",
				required: false,
				choices: ["Picasso", "Flash"],
				type: "string",
			},
			{
				key: "enhance_quality",
				label: "Enhance Quality",
				required: false,
				type: "boolean",
			},
		],
	},
};
