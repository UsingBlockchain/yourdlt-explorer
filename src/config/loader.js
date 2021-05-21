import Axios from 'axios';

const CONFIG_ROUTE = '/config';

export const loadConfig = () => Axios.get(window.location.origin + CONFIG_ROUTE)
	.then(res => {
		window.globalConfig = (res.data !== null && typeof res.data === 'object')
			? res.data
			: undefined;
	})
	.catch(() => {});
