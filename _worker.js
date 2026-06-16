
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n<tg-spoiler>入口: ${url.pathname + url.search}</tg-spoiler>`);
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
			<html lang="zh-CN">
				<head>
					<title>${FileName} 订阅管理</title>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1">
					<link rel="preconnect" href="https://fonts.googleapis.com">
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
					<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
					<style>
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						
						body {
							font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							min-height: 100vh;
							padding: 20px;
							line-height: 1.6;
							color: #1a1a2e;
						}
						
						.container {
							max-width: 900px;
							margin: 0 auto;
						}
						
						.header {
							text-align: center;
							margin-bottom: 30px;
							padding: 30px;
							background: rgba(255, 255, 255, 0.95);
							border-radius: 20px;
							backdrop-filter: blur(10px);
							box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
						}
						
						.header h1 {
							font-size: 28px;
							font-weight: 700;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							-webkit-background-clip: text;
							-webkit-text-fill-color: transparent;
							background-clip: text;
							margin-bottom: 10px;
						}
						
						.header p {
							color: #666;
							font-size: 14px;
						}
						
						.card {
							background: rgba(255, 255, 255, 0.95);
							border-radius: 16px;
							padding: 24px;
							margin-bottom: 20px;
							backdrop-filter: blur(10px);
							box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
							transition: transform 0.2s ease, box-shadow 0.2s ease;
						}
						
						.card:hover {
							transform: translateY(-2px);
							box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
						}
						
						.card-title {
							font-size: 18px;
							font-weight: 600;
							color: #1a1a2e;
							margin-bottom: 20px;
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.card-title::before {
							content: '';
							width: 4px;
							height: 20px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							border-radius: 2px;
						}
						
						.sub-list {
							display: grid;
							grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
							gap: 16px;
						}
						
						.sub-item {
							background: #f8f9fa;
							border-radius: 12px;
							padding: 16px;
							transition: all 0.2s ease;
							border: 1px solid transparent;
						}
						
						.sub-item:hover {
							background: #fff;
							border-color: #667eea;
							box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
						}
						
						.sub-label {
							font-size: 12px;
							font-weight: 600;
							color: #667eea;
							text-transform: uppercase;
							letter-spacing: 0.5px;
							margin-bottom: 8px;
						}
						
						.sub-link {
							font-size: 13px;
							color: #1a1a2e;
							word-break: break-all;
							cursor: pointer;
							display: flex;
							align-items: center;
							justify-content: space-between;
							gap: 10px;
						}
						
						.sub-link:hover {
							color: #667eea;
						}
						
						.sub-link .url {
							flex: 1;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						
						.copy-btn {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							border: none;
							padding: 6px 12px;
							border-radius: 6px;
							font-size: 11px;
							font-weight: 500;
							cursor: pointer;
							transition: all 0.2s ease;
							white-space: nowrap;
						}
						
						.copy-btn:hover {
							transform: scale(1.05);
							box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
						}
						
						.qr-container {
							margin-top: 12px;
							text-align: center;
							display: none;
						}
						
						.qr-container.active {
							display: block;
						}
						
						.qr-container canvas {
							border-radius: 8px;
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
						}
						
						.guest-toggle {
							text-align: center;
							margin: 20px 0;
						}
						
						.guest-toggle button {
							background: transparent;
							border: 2px solid #667eea;
							color: #667eea;
							padding: 10px 24px;
							border-radius: 30px;
							font-size: 14px;
							font-weight: 500;
							cursor: pointer;
							transition: all 0.2s ease;
						}
						
						.guest-toggle button:hover {
							background: #667eea;
							color: white;
						}
						
						.guest-section {
							display: none;
							margin-top: 20px;
							padding-top: 20px;
							border-top: 2px dashed #e0e0e0;
						}
						
						.guest-section.active {
							display: block;
						}
						
						.guest-token {
							background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
							border-radius: 10px;
							padding: 12px 16px;
							margin-bottom: 16px;
							display: flex;
							align-items: center;
							justify-content: space-between;
							gap: 10px;
						}
						
						.guest-token .label {
							font-size: 13px;
							color: #666;
						}
						
						.guest-token .token {
							font-family: 'SF Mono', Monaco, monospace;
							font-size: 14px;
							font-weight: 600;
							color: #1a1a2e;
							background: white;
							padding: 4px 12px;
							border-radius: 6px;
						}
						
						.editor-section {
							margin-top: 20px;
						}
						
						.editor {
							width: 100%;
							min-height: 280px;
							padding: 16px;
							border: 2px solid #e0e0e0;
							border-radius: 12px;
							font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
							font-size: 13px;
							line-height: 1.6;
							resize: vertical;
							transition: border-color 0.2s ease, box-shadow 0.2s ease;
							background: #fafafa;
						}
						
						.editor:focus {
							outline: none;
							border-color: #667eea;
							box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
							background: white;
						}
						
						.editor::placeholder {
							color: #aaa;
						}
						
						.save-bar {
							display: flex;
							align-items: center;
							gap: 12px;
							margin-top: 16px;
						}
						
						.save-btn {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							border: none;
							padding: 12px 32px;
							border-radius: 10px;
							font-size: 14px;
							font-weight: 600;
							cursor: pointer;
							transition: all 0.2s ease;
						}
						
						.save-btn:hover {
							transform: translateY(-2px);
							box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
						}
						
						.save-btn:disabled {
							opacity: 0.6;
							cursor: not-allowed;
							transform: none;
						}
						
						.save-status {
							font-size: 13px;
							color: #666;
						}
						
						.save-status.success {
							color: #28a745;
						}
						
						.save-status.error {
							color: #dc3545;
						}
						
						.config-item {
							display: flex;
							align-items: center;
							justify-content: space-between;
							padding: 12px 16px;
							background: #f8f9fa;
							border-radius: 10px;
							margin-bottom: 10px;
						}
						
						.config-label {
							font-size: 13px;
							color: #666;
							font-weight: 500;
						}
						
						.config-value {
							font-family: 'SF Mono', Monaco, monospace;
							font-size: 12px;
							color: #1a1a2e;
							background: white;
							padding: 4px 10px;
							border-radius: 6px;
							max-width: 60%;
							word-break: break-all;
						}
						
						.footer {
							text-align: center;
							margin-top: 30px;
							padding: 20px;
							color: rgba(255, 255, 255, 0.8);
							font-size: 13px;
						}
						
						.footer a {
							color: white;
							text-decoration: none;
						}
						
						.ua-info {
							background: rgba(255, 255, 255, 0.2);
							border-radius: 8px;
							padding: 10px 16px;
							margin-top: 16px;
							font-size: 12px;
							color: rgba(255, 255, 255, 0.9);
							word-break: break-all;
						}
						
						@media (max-width: 600px) {
							body {
								padding: 12px;
							}
							
							.header h1 {
								font-size: 22px;
							}
							
							.sub-list {
								grid-template-columns: 1fr;
							}
							
							.config-item {
								flex-direction: column;
								align-items: flex-start;
								gap: 8px;
							}
							
							.config-value {
								max-width: 100%;
							}
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
					<div class="container">
						<div class="header">
							<h1>${FileName}</h1>
							<p>订阅汇聚管理面板</p>
						</div>
						
						<div class="card">
							<div class="card-title">订阅地址</div>
							<div class="sub-list">
								<div class="sub-item">
									<div class="sub-label">自适应订阅</div>
									<div class="sub-link">
										<span class="url" id="url_auto">https://${url.hostname}/${mytoken}</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}', 'qrcode_0')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_0"></div>
								</div>
								<div class="sub-item">
									<div class="sub-label">Base64 订阅</div>
									<div class="sub-link">
										<span class="url" id="url_b64">https://${url.hostname}/${mytoken}?b64</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}?b64', 'qrcode_1')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_1"></div>
								</div>
								<div class="sub-item">
									<div class="sub-label">Clash 订阅</div>
									<div class="sub-link">
										<span class="url" id="url_clash">https://${url.hostname}/${mytoken}?clash</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}?clash', 'qrcode_2')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_2"></div>
								</div>
								<div class="sub-item">
									<div class="sub-label">Sing-box 订阅</div>
									<div class="sub-link">
										<span class="url" id="url_sb">https://${url.hostname}/${mytoken}?sb</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}?sb', 'qrcode_3')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_3"></div>
								</div>
								<div class="sub-item">
									<div class="sub-label">Surge 订阅</div>
									<div class="sub-link">
										<span class="url" id="url_surge">https://${url.hostname}/${mytoken}?surge</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}?surge', 'qrcode_4')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_4"></div>
								</div>
								<div class="sub-item">
									<div class="sub-label">Loon 订阅</div>
									<div class="sub-link">
										<span class="url" id="url_loon">https://${url.hostname}/${mytoken}?loon</span>
										<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/${mytoken}?loon', 'qrcode_5')">复制</button>
									</div>
									<div class="qr-container" id="qrcode_5"></div>
								</div>
							</div>
							
							<div class="guest-toggle">
								<button id="guestToggleBtn" onclick="toggleGuest()">展开访客订阅</button>
							</div>
							
							<div class="guest-section" id="guestSection">
								<div class="guest-token">
									<span class="label">访客 TOKEN</span>
									<span class="token">${guest}</span>
								</div>
								<div class="sub-list">
									<div class="sub-item">
										<div class="sub-label">访客 - 自适应</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}', 'guest_0')">复制</button>
										</div>
										<div class="qr-container" id="guest_0"></div>
									</div>
									<div class="sub-item">
										<div class="sub-label">访客 - Base64</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}&b64</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}&b64', 'guest_1')">复制</button>
										</div>
										<div class="qr-container" id="guest_1"></div>
									</div>
									<div class="sub-item">
										<div class="sub-label">访客 - Clash</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}&clash</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}&clash', 'guest_2')">复制</button>
										</div>
										<div class="qr-container" id="guest_2"></div>
									</div>
									<div class="sub-item">
										<div class="sub-label">访客 - Sing-box</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}&sb</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}&sb', 'guest_3')">复制</button>
										</div>
										<div class="qr-container" id="guest_3"></div>
									</div>
									<div class="sub-item">
										<div class="sub-label">访客 - Surge</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}&surge</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}&surge', 'guest_4')">复制</button>
										</div>
										<div class="qr-container" id="guest_4"></div>
									</div>
									<div class="sub-item">
										<div class="sub-label">访客 - Loon</div>
										<div class="sub-link">
											<span class="url">https://${url.hostname}/sub?token=${guest}&loon</span>
											<button class="copy-btn" onclick="copyWithQR('https://${url.hostname}/sub?token=${guest}&loon', 'guest_5')">复制</button>
										</div>
										<div class="qr-container" id="guest_5"></div>
									</div>
								</div>
							</div>
						</div>
						
						<div class="card">
							<div class="card-title">订阅转换配置</div>
							<div class="config-item">
								<span class="config-label">SUBAPI（订阅转换后端）</span>
								<span class="config-value">${subProtocol}://${subConverter}</span>
							</div>
							<div class="config-item">
								<span class="config-label">SUBCONFIG（配置文件）</span>
								<span class="config-value">${subConfig}</span>
							</div>
						</div>
						
						<div class="card">
							<div class="card-title">节点与订阅编辑</div>
							${hasKV ? `
							<textarea class="editor" 
								placeholder="在此输入节点链接或订阅链接，每行一个&#10;&#10;示例：&#10;vless://xxxxx@host:443?...&#10;vmess://xxxxx&#10;https://sub.example.com/auto"
								id="content">${content}</textarea>
							<div class="save-bar">
								<button class="save-btn" id="saveBtn" onclick="saveContent()">保存配置</button>
								<span class="save-status" id="saveStatus"></span>
							</div>
							` : '<p style="color: #666; text-align: center; padding: 40px;">请绑定变量名称为 <strong>KV</strong> 的 KV 命名空间</p>'}
						</div>
						
						<div class="footer">
							<p>UA: <span style="font-family: monospace; opacity: 0.8;">${request.headers.get('User-Agent')}</span></p>
						</div>
					</div>
					
					<script>
					function copyWithQR(text, qrId) {
						navigator.clipboard.writeText(text).then(() => {
							const btn = event.target;
							const originalText = btn.textContent;
							btn.textContent = '已复制';
							btn.style.background = '#28a745';
							setTimeout(() => {
								btn.textContent = originalText;
								btn.style.background = '';
							}, 2000);
						}).catch(err => {
							console.error('复制失败:', err);
							const textarea = document.createElement('textarea');
							textarea.value = text;
							document.body.appendChild(textarea);
							textarea.select();
							document.execCommand('copy');
							document.body.removeChild(textarea);
							const btn = event.target;
							btn.textContent = '已复制';
							btn.style.background = '#28a745';
							setTimeout(() => {
								btn.textContent = '复制';
								btn.style.background = '';
							}, 2000);
						});
						
						const qrDiv = document.getElementById(qrId);
						if (qrDiv.classList.contains('active')) {
							qrDiv.classList.remove('active');
							qrDiv.innerHTML = '';
						} else {
							qrDiv.innerHTML = '';
							qrDiv.classList.add('active');
							new QRCode(qrDiv, {
								text: text,
								width: 160,
								height: 160,
								colorDark: "#1a1a2e",
								colorLight: "#ffffff",
								correctLevel: QRCode.CorrectLevel.M
							});
						}
					}
					
					function toggleGuest() {
						const section = document.getElementById('guestSection');
						const btn = document.getElementById('guestToggleBtn');
						if (section.classList.contains('active')) {
							section.classList.remove('active');
							btn.textContent = '展开访客订阅';
						} else {
							section.classList.add('active');
							btn.textContent = '收起访客订阅';
						}
					}
					
					function saveContent() {
						const textarea = document.getElementById('content');
						const btn = document.getElementById('saveBtn');
						const status = document.getElementById('saveStatus');
						
						if (!textarea) return;
						
						const content = textarea.value;
						const originalContent = textarea.defaultValue;
						
						if (content === originalContent) {
							status.textContent = '内容未变化';
							status.className = 'save-status';
							return;
						}
						
						btn.disabled = true;
						btn.textContent = '保存中...';
						status.textContent = '';
						
						fetch(window.location.href, {
							method: 'POST',
							body: content,
							headers: {
								'Content-Type': 'text/plain;charset=UTF-8'
							},
							cache: 'no-cache'
						})
						.then(response => {
							if (!response.ok) throw new Error('HTTP ' + response.status);
							return response.text();
						})
						.then(() => {
							const now = new Date().toLocaleString('zh-CN');
							status.textContent = '✓ 已保存 ' + now;
							status.className = 'save-status success';
							textarea.defaultValue = content;
							document.title = '已保存 - ${FileName}';
						})
						.catch(error => {
							status.textContent = '✗ 保存失败: ' + error.message;
							status.className = 'save-status error';
						})
						.finally(() => {
							btn.disabled = false;
							btn.textContent = '保存配置';
						});
					}
					
					document.addEventListener('DOMContentLoaded', () => {
						const textarea = document.getElementById('content');
						if (textarea) {
							let saveTimer;
							textarea.addEventListener('input', () => {
								clearTimeout(saveTimer);
								const status = document.getElementById('saveStatus');
								status.textContent = '有未保存的更改';
								status.className = 'save-status';
							});
						}
					});
					</script>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}