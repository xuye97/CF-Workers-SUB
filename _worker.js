
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
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
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
		
		// 从 KV 读取配置（优先级：KV > 环境变量 > 默认值）
		let KVConfig = {};
		if (env.KV) {
			try {
				const kvConfigStr = await env.KV.get('CONFIG.json');
				if (kvConfigStr) {
					KVConfig = JSON.parse(kvConfigStr);
				}
			} catch (e) {
				console.log('读取CONFIG.json失败:', e);
			}
		}
		BotToken = KVConfig.TGTOKEN || BotToken;
		ChatID = KVConfig.TGID || ChatID;
		TG = KVConfig.TG !== undefined ? KVConfig.TG : TG;

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
							}

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

			if (订阅格式 == 'clash') {
				// 优先返回自定义 Clash 配置
				if (env.KV) {
					try {
						const customClashConfig = await env.KV.get('clash-config.yaml');
						if (customClashConfig && customClashConfig.trim()) {
							if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
							return new Response(customClashConfig, { headers: responseHeaders });
						}
					} catch (e) {
						console.log('读取自定义Clash配置失败:', e);
					}
				}
			}
			
			// 如果是其他客户端（已砍掉远程转换）或者无自定义配置的 Clash，均降级返回 Base64 节点数据
			return new Response(base64Data, { headers: responseHeaders });
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
			
			// 鉴权：校验 URL 中的 token 是否为主 TOKEN 或访客 TOKEN
			const postToken = url.searchParams.get('token') || '';
			const postPathToken = url.pathname.split('/').pop() || '';
			const validTokens = [mytoken, guest];
			if (!validTokens.includes(postToken) && !validTokens.includes(postPathToken)) {
				return new Response("未授权", { status: 403 });
			}
			
			// 访客只允许 GET，禁止 POST
			if (validTokens.includes(postToken) && postToken !== mytoken || validTokens.includes(postPathToken) && postPathToken !== mytoken) {
				return new Response("访客无写入权限", { status: 403 });
			}
			
			try {
				const contentType = request.headers.get('Content-Type') || '';
				const body = await request.text();
				
				// 判断是保存配置还是保存节点数据
				if (contentType.includes('application/json')) {
					const data = JSON.parse(body);
					
					// 保存 Clash 配置
					if (data.type === 'clash-config') {
						await env.KV.put('clash-config.yaml', data.content);
						return new Response(JSON.stringify({ success: true, message: "Clash配置保存成功" }), {
							headers: { 'Content-Type': 'application/json' }
						});
					}
					
					// 保存配置到 CONFIG.json
					const config = data;
					const existingConfig = await env.KV.get('CONFIG.json');
					const mergedConfig = existingConfig ? { ...JSON.parse(existingConfig), ...config } : config;
					await env.KV.put('CONFIG.json', JSON.stringify(mergedConfig, null, 2));
					return new Response(JSON.stringify({ success: true, message: "配置保存成功" }), {
						headers: { 'Content-Type': 'application/json' }
					});
				} else {
					// 保存节点数据
					await env.KV.put(txt, body);
					return new Response("保存成功");
				}
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let clashConfigContent = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
			try {
				clashConfigContent = await env.KV.get('clash-config.yaml') || '';
			} catch (error) {
				console.error('读取Clash配置时发生错误:', error);
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
						:root {
							--bg-gradient-start: #667eea;
							--bg-gradient-end: #764ba2;
							--text-primary: #1a1a2e;
							--text-secondary: #666;
							--text-hint: #888;
							--card-bg: rgba(255, 255, 255, 0.95);
							--card-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
							--card-hover-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
							--sub-item-bg: #f8f9fa;
							--sub-item-hover-bg: #fff;
							--input-bg: #fafafa;
							--input-border: #e0e0e0;
							--border-color: #e0e0e0;
							--editor-bg: #fafafa;
							--footer-color: rgba(255, 255, 255, 0.8);
						}
						
						[data-theme="dark"] {
							--bg-gradient-start: #1a1a2e;
							--bg-gradient-end: #16213e;
							--text-primary: #e4e6eb;
							--text-secondary: #b0b3b8;
							--text-hint: #8a8d91;
							--card-bg: rgba(30, 30, 50, 0.95);
							--card-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
							--card-hover-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
							--sub-item-bg: rgba(50, 50, 70, 0.8);
							--sub-item-hover-bg: rgba(60, 60, 90, 0.9);
							--input-bg: rgba(40, 40, 60, 0.8);
							--input-border: rgba(100, 100, 140, 0.5);
							--border-color: rgba(100, 100, 140, 0.5);
							--editor-bg: rgba(30, 30, 50, 0.9);
							--footer-color: rgba(255, 255, 255, 0.7);
						}
						
						* {
							margin: 0;
							padding: 0;
							box-sizing: border-box;
						}
						
						body {
							font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
							background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
							min-height: 100vh;
							padding: 20px;
							line-height: 1.6;
							color: var(--text-primary);
							transition: background 0.3s ease, color 0.3s ease;
						}
						
						.container {
							max-width: 900px;
							margin: 0 auto;
						}
						
						.header {
							text-align: center;
							margin-bottom: 30px;
							padding: 30px;
							background: var(--card-bg);
							border-radius: 20px;
							backdrop-filter: blur(10px);
							box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
							transition: background 0.3s ease, box-shadow 0.3s ease;
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
							color: var(--text-secondary);
							font-size: 14px;
						}
						
						.card {
							background: var(--card-bg);
							border-radius: 16px;
							margin-bottom: 20px;
							backdrop-filter: blur(10px);
							box-shadow: var(--card-shadow);
							transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
							overflow: hidden;
						}
						
						.card:hover {
							box-shadow: var(--card-hover-shadow);
						}
						
						.card-title {
							font-size: 18px;
							font-weight: 600;
							color: var(--text-primary);
							padding: 20px 24px;
							display: flex;
							align-items: center;
							justify-content: space-between;
							cursor: pointer;
							user-select: none;
							transition: background 0.2s ease;
						}
						
						.card-title:hover {
							background: rgba(102, 126, 234, 0.05);
						}
						
						.card-title::before {
							content: '';
							width: 4px;
							height: 20px;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							border-radius: 2px;
							flex-shrink: 0;
						}
						
						.card-title-left {
							display: flex;
							align-items: center;
							gap: 10px;
						}
						
						.card-title-arrow {
							width: 24px;
							height: 24px;
							display: flex;
							align-items: center;
							justify-content: center;
							transition: transform 0.3s ease;
							color: var(--text-secondary);
							font-size: 12px;
						}
						
						.card.collapsed .card-title-arrow {
							transform: rotate(-90deg);
						}
						
						.card-content {
							padding: 0 24px 24px;
							transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
							max-height: 2000px;
							opacity: 1;
							overflow: hidden;
						}
						
						.card.collapsed .card-content {
							max-height: 0;
							opacity: 0;
							padding-top: 0;
							padding-bottom: 0;
						}
						
						.sub-list {
							display: grid;
							grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
							gap: 16px;
						}
						
						.sub-item {
							background: var(--sub-item-bg);
							border-radius: 12px;
							padding: 16px;
							transition: all 0.2s ease;
							border: 1px solid transparent;
						}
						
						.sub-item:hover {
							background: var(--sub-item-hover-bg);
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
							color: var(--text-primary);
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
							border-top: 2px dashed var(--border-color);
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
						
						[data-theme="dark"] .guest-token {
							background: linear-gradient(135deg, rgba(50, 50, 70, 0.8) 0%, rgba(40, 40, 60, 0.9) 100%);
						}
						
						.guest-token .label {
							font-size: 13px;
							color: var(--text-secondary);
						}
						
						.guest-token .token {
							font-family: 'SF Mono', Monaco, monospace;
							font-size: 14px;
							font-weight: 600;
							color: var(--text-primary);
							background: rgba(255, 255, 255, 0.9);
							padding: 4px 12px;
							border-radius: 6px;
						}
						
						[data-theme="dark"] .guest-token .token {
							background: rgba(30, 30, 50, 0.9);
						}
						
						.editor-section {
							margin-top: 20px;
						}
						
						.editor-container {
							position: relative;
							width: 100%;
						}
						.editor-bg {
							position: absolute;
							top: 0; left: 0;
							width: 100%; height: 100%;
							padding: 16px;
							border: 2px solid transparent;
							border-radius: 12px;
							font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
							font-size: 13px;
							line-height: 1.6;
							box-sizing: border-box;
							white-space: pre-wrap;
							word-wrap: break-word;
							overflow-wrap: break-word;
							overflow-y: auto;
							background: var(--editor-bg);
							color: var(--text-primary);
							z-index: 1;
							pointer-events: none;
						}
						.editor-bg::-webkit-scrollbar {
							width: 8px;
							background: transparent;
						}
						.editor-bg::-webkit-scrollbar-thumb {
							background: transparent;
						}
						.editor {
							width: 100%;
							min-height: 280px;
							padding: 16px;
							border: 2px solid var(--input-border);
							border-radius: 12px;
							font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
							font-size: 13px;
							line-height: 1.6;
							resize: vertical;
							transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.3s ease;
							background: var(--editor-bg);
							color: var(--text-primary);
						}
						#content {
							position: relative;
							z-index: 2;
							background: transparent !important;
							color: transparent !important;
							caret-color: var(--text-primary);
						}
						#content::selection {
							background: rgba(0, 120, 255, 0.2);
							color: transparent;
						}
						#content::-moz-selection {
							background: rgba(0, 120, 255, 0.2);
							color: transparent;
						}
						
						.editor:focus {
							outline: none;
							border-color: #667eea;
							box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
						}
						
						.editor::placeholder {
							color: var(--text-hint);
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
							color: var(--text-secondary);
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
							background: var(--sub-item-bg);
							border-radius: 10px;
							margin-bottom: 10px;
						}
						
						.config-label {
							font-size: 13px;
							color: var(--text-secondary);
							font-weight: 500;
						}
						
						.config-value {
							font-family: 'SF Mono', Monaco, monospace;
							font-size: 12px;
							color: var(--text-primary);
							background: rgba(255, 255, 255, 0.9);
							padding: 4px 10px;
							border-radius: 6px;
							max-width: 60%;
							word-break: break-all;
						}
						
						[data-theme="dark"] .config-value {
							background: rgba(30, 30, 50, 0.9);
						}
						
						.settings-form {
							display: flex;
							flex-direction: column;
							gap: 16px;
						}
						
						.form-group {
							display: flex;
							flex-direction: column;
							gap: 6px;
						}
						
						.form-label {
							font-size: 13px;
							font-weight: 600;
							color: var(--text-primary);
						}
						
						.form-input {
							padding: 12px 14px;
							border: 2px solid var(--input-border);
							border-radius: 10px;
							font-size: 14px;
							transition: all 0.2s ease;
							background: var(--input-bg);
							color: var(--text-primary);
						}
						
						.form-input:focus {
							outline: none;
							border-color: #667eea;
							box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
						}
						
						.form-input::placeholder {
							color: var(--text-hint);
						}
						
						.form-hint {
							font-size: 11px;
							color: var(--text-hint);
						}
						
						select.form-input {
							cursor: pointer;
							appearance: none;
							background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
							background-repeat: no-repeat;
							background-position: right 12px center;
							padding-right: 36px;
						}
						
						.editor-header {
							display: flex;
							align-items: center;
							justify-content: space-between;
							margin-bottom: 12px;
						}
						
						.editor-hint {
							font-size: 13px;
							color: var(--text-secondary);
						}
						
						.reset-btn {
							background: transparent;
							border: 1px solid var(--border-color);
							color: var(--text-secondary);
							padding: 6px 12px;
							border-radius: 6px;
							font-size: 12px;
							cursor: pointer;
							transition: all 0.2s ease;
						}
						
						.reset-btn:hover {
							background: rgba(102, 126, 234, 0.1);
							border-color: #667eea;
						}
						
						.editor-actions {
							display: flex;
							gap: 8px;
						}
						
						.action-btn {
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							color: white;
							border: none;
							padding: 6px 12px;
							border-radius: 6px;
							font-size: 12px;
							cursor: pointer;
							transition: all 0.2s ease;
						}
						
						.action-btn:hover {
							transform: translateY(-1px);
							box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
						}
						
						.yaml-editor {
							font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
							font-size: 12px;
							line-height: 1.5;
							tab-size: 2;
						}
						
						.footer {
							text-align: center;
							margin-top: 30px;
							padding: 20px;
							color: var(--footer-color);
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
						
						.theme-toggle {
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 12px;
							margin-top: 20px;
							padding: 16px;
							background: rgba(255, 255, 255, 0.15);
							border-radius: 12px;
							backdrop-filter: blur(10px);
						}
						
						.theme-toggle-label {
							font-size: 14px;
							color: var(--footer-color);
							font-weight: 500;
						}
						
						.theme-switch {
							position: relative;
							width: 56px;
							height: 28px;
							cursor: pointer;
						}
						
						.theme-switch input {
							opacity: 0;
							width: 0;
							height: 0;
						}
						
						.theme-slider {
							position: absolute;
							inset: 0;
							background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
							border-radius: 28px;
							transition: 0.3s;
						}
						
						.theme-slider::before {
							content: '';
							position: absolute;
							height: 22px;
							width: 22px;
							left: 3px;
							bottom: 3px;
							background: white;
							border-radius: 50%;
							transition: 0.3s;
						}
						
						.theme-switch input:checked + .theme-slider::before {
							transform: translateX(28px);
						}
						
						.theme-icon {
							font-size: 18px;
							color: var(--footer-color);
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
						
						<div class="card collapsed" id="card-sub">
							<div class="card-title" onclick="toggleCard('card-sub')">
								<div class="card-title-left">订阅地址</div>
								<div class="card-title-arrow">▼</div>
							</div>
							<div class="card-content">
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
						</div>
						

						<div class="card collapsed" id="card-tg">
							<div class="card-title" onclick="toggleCard('card-tg')">
								<div class="card-title-left">Telegram 通知设置</div>
								<div class="card-title-arrow">▼</div>
							</div>
							<div class="card-content">
								${hasKV ? `
								<div class="settings-form">
									<div class="form-group">
										<label class="form-label">Bot Token</label>
										<input type="text" class="form-input" id="tgToken" placeholder="例如: 6894123456:XXXXXXXXXX..." value="${BotToken || ''}">
										<span class="form-hint">从 @BotFather 获取</span>
									</div>
									<div class="form-group">
										<label class="form-label">Chat ID</label>
										<input type="text" class="form-input" id="tgChatId" placeholder="例如: 6946912345" value="${ChatID || ''}">
										<span class="form-hint">从 @userinfobot 获取</span>
									</div>
									<div class="form-group">
										<label class="form-label">推送模式</label>
										<select class="form-input" id="tgMode">
											<option value="0" ${TG == 0 ? 'selected' : ''}>仅推送异常访问</option>
											<option value="1" ${TG == 1 ? 'selected' : ''}>推送所有访问</option>
											<option value="2" ${TG == 2 ? 'selected' : ''}>关闭通知</option>
										</select>
									</div>
									<div class="save-bar">
										<button class="save-btn" onclick="saveTGConfig()">保存设置</button>
										<span class="save-status" id="tgSaveStatus"></span>
									</div>
								</div>
								` : '<p style="color: #666; text-align: center; padding: 20px;">请绑定变量名称为 <strong>KV</strong> 的 KV 命名空间</p>'}
							</div>
						</div>
						
						<div class="card collapsed" id="card-clash">
							<div class="card-title" onclick="toggleCard('card-clash')">
								<div class="card-title-left">Clash 订阅配置</div>
								<div class="card-title-arrow">▼</div>
							</div>
							<div class="card-content">
								${hasKV ? `
								<div class="editor-header">
									<span class="editor-hint">自定义 Clash 订阅转换配置（YAML 格式）</span>
									<div class="editor-actions">
										<button class="action-btn" onclick="generateFromSubs()">从节点与订阅生成</button>
										<button class="reset-btn" onclick="resetClashConfig()">恢复默认</button>
									</div>
								</div>
								<textarea class="editor yaml-editor" 
									placeholder="Clash 配置文件内容..."
									id="clashConfig">${clashConfigContent}</textarea>
								<div class="save-bar">
									<button class="save-btn" id="clashSaveBtn" onclick="saveClashConfig()">保存配置</button>
									<span class="save-status" id="clashSaveStatus"></span>
								</div>
								` : '<p style="color: #666; text-align: center; padding: 20px;">请绑定变量名称为 <strong>KV</strong> 的 KV 命名空间</p>'}
							</div>
						</div>
						
						<div class="card collapsed" id="card-editor">
							<div class="card-title" onclick="toggleCard('card-editor')">
								<div class="card-title-left">节点与订阅编辑</div>
								<div class="card-title-arrow">▼</div>
							</div>
							<div class="card-content">
								${hasKV ? `
								<div class="editor-container">
									<div class="editor-bg" id="contentBg" aria-hidden="true"></div>
									<textarea class="editor" 
										placeholder="在此输入节点链接或订阅链接，每行一个&#10;&#10;示例：&#10;vless://xxxxx@host:443?...&#10;vmess://xxxxx&#10;https://sub.example.com/auto"
										id="content" oninput="updateEditorBg()" onscroll="syncEditorScroll()">${content}</textarea>
								</div>
								<div class="save-bar">
									<button class="save-btn" id="saveBtn" onclick="saveContent()">保存配置</button>
									<span class="save-status" id="saveStatus"></span>
								</div>
								` : '<p style="color: #666; text-align: center; padding: 40px;">请绑定变量名称为 <strong>KV</strong> 的 KV 命名空间</p>'}
							</div>
						</div>
						
						<div class="footer">
							<p>UA: <span style="font-family: monospace; opacity: 0.8;">${request.headers.get('User-Agent')}</span></p>
							<div class="theme-toggle">
								<span class="theme-icon">☀️</span>
								<label class="theme-switch">
									<input type="checkbox" id="themeToggle" onchange="toggleTheme()">
									<span class="theme-slider"></span>
								</label>
								<span class="theme-icon">🌙</span>
								<span class="theme-toggle-label" id="themeLabel">日间模式</span>
							</div>
						</div>
					</div>
					
					<script>
					function toggleTheme() {
						const isDark = document.getElementById('themeToggle').checked;
						document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
						localStorage.setItem('theme', isDark ? 'dark' : 'light');
						document.getElementById('themeLabel').textContent = isDark ? '夜间模式' : '日间模式';
					}
					
					function initTheme() {
						const savedTheme = localStorage.getItem('theme') || 'light';
						const isDark = savedTheme === 'dark';
						document.documentElement.setAttribute('data-theme', savedTheme);
						document.getElementById('themeToggle').checked = isDark;
						document.getElementById('themeLabel').textContent = isDark ? '夜间模式' : '日间模式';
					}
					
					function updateEditorBg() {
						const el = document.getElementById('content');
						const bg = document.getElementById('contentBg');
						if (!el || !bg) return;
						let text = el.value;
						if (!text) {
							bg.innerHTML = '<span style="color: var(--text-secondary); opacity: 0.6">' + el.getAttribute('placeholder').replace(/&#10;/g, '<br>') + '</span>';
							return;
						}
						text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
						text = text.replace(/(#.*?)$/gm, '<span style="color: #888; opacity: 0.8;">$1</span>');
						if (text.endsWith('\\n')) text += '<br>';
						bg.innerHTML = text;
					}
					function syncEditorScroll() {
						const el = document.getElementById('content');
						const bg = document.getElementById('contentBg');
						if (el && bg) bg.scrollTop = el.scrollTop;
					}
					setTimeout(updateEditorBg, 100);
					
					function toggleCard(cardId) {
						const card = document.getElementById(cardId);
						if (card) {
							card.classList.toggle('collapsed');
						}
					}
					
					function saveClashConfig() {
						const textarea = document.getElementById('clashConfig');
						const btn = document.getElementById('clashSaveBtn');
						const status = document.getElementById('clashSaveStatus');
						
						if (!textarea) return;
						
						const content = textarea.value;
						
						btn.disabled = true;
						btn.textContent = '保存中...';
						status.textContent = '';
						
						fetch(window.location.href, {
							method: 'POST',
							body: JSON.stringify({ type: 'clash-config', content: content }),
							headers: {
								'Content-Type': 'application/json'
							},
							cache: 'no-cache'
						})
						.then(response => {
							if (!response.ok) throw new Error('HTTP ' + response.status);
							return response.json();
						})
						.then(data => {
							const now = new Date().toLocaleString('zh-CN');
							status.textContent = '✓ Clash配置已保存 ' + now;
							status.className = 'save-status success';
							textarea.defaultValue = content;
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
					
					function resetClashConfig() {
						if (!confirm('确定要恢复默认配置吗？当前修改将丢失。')) return;
						
						const defaultConfig = \`# Clash 订阅转换配置
# 文档: https://github.com/nicegram/Clash-for-Windows

# 基础设置
mixed-port: 7890
allow-lan: false
bind-address: '*'
mode: rule
log-level: info
external-controller: 127.0.0.1:9090

# DNS 设置
dns:
  enable: true
  listen: 0.0.0.0:53
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 8.8.8.8
    - 1.1.1.1
  fallback-filter:
    geoip: true
    geoip-code: CN

# 代理组
proxy-groups:
  - name: Proxy
    type: select
    proxies:
      - DIRECT
      - REJECT

# 规则
rules:
  - GEOIP,LAN,DIRECT,no-resolve
  - GEOIP,CN,DIRECT,no-resolve
  - MATCH,Proxy\`;
						
						const textarea = document.getElementById('clashConfig');
						if (textarea) {
							textarea.value = defaultConfig;
						}
					}
					
					function hashString(str) {
						var hash = 0;
						var sha1 = 0;
						for (var i = 0; i < str.length; i++) {
							var char = str.charCodeAt(i);
							hash = ((hash << 5) - hash) + char;
							hash = hash & hash;
							sha1 = ((sha1 << 7) - sha1) + char;
							sha1 = sha1 & sha1;
						}
						var md5Hex = Math.abs(hash).toString(16).padStart(8, '0');
						var sha1Hex = Math.abs(sha1).toString(16).padStart(8, '0');
						return md5Hex + sha1Hex;
					}
					
					function stripProxiesProvidersUse(config) {
						var lines = config.split('\\n');
						var result = [];
						var skip = false;
						var skipIndent = -1;
						var inProxyGroups = false;
						
						for (var i = 0; i < lines.length; i++) {
							var t = lines[i].trim();
							var leadingSpaces = lines[i].length - lines[i].trimStart().length;
							
							// 跟踪是否在 proxy-groups 内
							if (t === 'proxy-groups:') { inProxyGroups = true; }
							if (inProxyGroups && (t === 'rules:' || t === 'proxy-providers:' || t === 'rule-providers:')) { inProxyGroups = false; }
							
							// 跳过 proxies: 整个段
							if (!inProxyGroups && t === 'proxies:') { skip = true; skipIndent = leadingSpaces; continue; }
							// 跳过 proxy-providers: 整个段
							if (t === 'proxy-providers:') { skip = true; skipIndent = leadingSpaces; continue; }
							// proxy-groups 内的 proxies: 和 use: 都跳过
							if (inProxyGroups && (t === 'proxies:' || t === 'use:')) { skip = true; skipIndent = leadingSpaces; continue; }
							
							// 遇到同级或更高级别的非空非注释行时停止跳过
							if (skip && t.length > 0 && !lines[i].startsWith('#')) {
								if (leadingSpaces <= skipIndent) {
									skip = false;
								} else {
									continue;
								}
							} else if (skip && t === '') {
								continue;
							}
							
							if (skip) continue;
							result.push(lines[i]);
						}
						return result.join('\\n');
					}
					
					function generateFromSubs() {
						const contentEditor = document.getElementById('content');
						const clashEditor = document.getElementById('clashConfig');
						
						if (!contentEditor || !clashEditor) {
							alert('找不到节点与订阅编辑器');
							return;
						}
						
						const subsContent = contentEditor.value.trim();
						const existingConfig = clashEditor.value.trim();
						
						// 分析节点与订阅编辑器中的内容
						const lines = subsContent.split('\\n').filter(line => line.trim());
						const newNodes = [];
						const newProviders = [];
						
						lines.forEach(line => {
							line = line.trim();
							if (!line) return;
							
							if (line.match(/^(vless|vmess|trojan|ss|ssr|socks|http|hysteria2?|tuic|wg|wireguard):\\/\\//i)) {
								const name = extractNodeName(line);
								newNodes.push({ name, type: getNodeType(line), node: line });
							} else if (line.match(/^https?:\\/\\//i)) {
								let actualUrl = line;
								let customName = null;
								const hashIndex = line.indexOf('#');
								if (hashIndex !== -1) {
									customName = line.substring(hashIndex + 1).trim();
									actualUrl = line.substring(0, hashIndex).trim();
								}
								newProviders.push({ customName: customName, url: actualUrl });
							}
						});
						
						// 如果配置为空，生成默认配置
						if (!existingConfig) {
							generateDefaultConfig(newNodes, newProviders);
							return;
						}
						
						// 清空原有的 proxies、proxy-providers、use
						let config = stripProxiesProvidersUse(existingConfig);
						
						// 重新生成 proxies
						if (newNodes.length > 0) {
							let proxiesSection = '# 代理节点\\nproxies:\\n';
							newNodes.forEach(n => {
								proxiesSection += parseNodeToClash(n.node, n.name) + '\\n';
							});
							proxiesSection += '\\n';
							config = proxiesSection + config;
						}
						
						// 重新生成 proxy-providers
						if (newProviders.length > 0) {
							let providersSection = 'proxy-providers:\\n';
							newProviders.forEach(p => {
								p.providerName = p.customName ? p.customName : 'sub_' + hashString(p.url);
								providersSection += \`  \${p.providerName}:\\n\`;
								providersSection += \`    url: "\${p.url}"\\n\`;
								providersSection += '    type: http\\n';
								providersSection += '    interval: 3600\\n';
								providersSection += '    proxy: DIRECT\\n';
								providersSection += '    health-check: {enable: true, url: "http://google.com/generate_204", interval: 300}\\n';
								providersSection += '    override:\\n';
								providersSection += \`      additional-prefix: "[\${p.providerName}]"\\n\`;
							});
							providersSection += '\\n';
							config = providersSection + config;
						}
						
						// 重建 proxy-groups 中的 use: 引用
						var nodeNames = newNodes.map(n => n.name);
						var providerNames = newProviders.map(p => p.customName ? p.customName : 'sub_' + hashString(p.url));
						if (nodeNames.length > 0 || providerNames.length > 0) {
							config = updateProxyGroups(config, nodeNames, providerNames);
						}
						
						clashEditor.value = config;
						
						var msg = 'Clash 配置已同步：\\n';
						msg += '- 代理节点: ' + newNodes.length + ' 个\\n';
						msg += '- 订阅提供者: ' + newProviders.length + ' 个';
						alert(msg);
					}
					
					function generateDefaultConfig(nodes, providers) {
						let config = \`# Clash 订阅配置
# 自动生成于 \${new Date().toLocaleString('zh-CN')}

# 基础设置
mixed-port: 7890
allow-lan: false
bind-address: '*'
mode: rule
log-level: info
external-controller: 127.0.0.1:9090

# DNS 设置
dns:
  enable: true
  listen: 0.0.0.0:53
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  nameserver:
    - 223.5.5.5
    - 119.29.29.29
  fallback:
    - 8.8.8.8
    - 1.1.1.1
  fallback-filter:
    geoip: true
    geoip-code: CN

					\`;
						
						// 添加订阅提供者
						if (providers.length > 0) {
							config += 'proxy-providers:\\n';
							providers.forEach(p => {
								p.providerName = p.customName ? p.customName : 'sub_' + hashString(p.url);
								config += \`  \${p.providerName}:\\n\`;
								config += \`    url: "\${p.url}"\\n\`;
								config += '    type: http\\n';
								config += '    interval: 3600\\n';
								config += '    proxy: DIRECT\\n';
								config += '    health-check: {enable: true, url: "http://google.com/generate_204", interval: 300}\\n';
								config += '    override:\\n';
								config += \`      additional-prefix: "[\${p.providerName}]"\\n\`;
							});
							config += '\\n';
						}
						
						// 添加代理节点
						if (nodes.length > 0) {
							config += '# 代理节点\\nproxies:\\n';
							nodes.forEach(n => {
								config += parseNodeToClash(n.node, n.name) + '\\n';
							});
							config += '\\n';
						}
						
						// 生成代理组
						config += '# 代理组\\nproxy-groups:\\n';
						config += '  - name: Proxy\\n    type: select\\n    proxies:\\n      - DIRECT\\n      - 手动切换\\n      - 自动选择\\n';
						
						nodes.forEach(n => {
							config += \`      - \${n.name}\\n\`;
						});
						
						if (providers.length > 0) {
							config += '    use:\\n';
							providers.forEach(p => {
								config += \`      - \${p.providerName}\\n\`;
							});
						}
						
						if (nodes.length > 3 || providers.length > 0) {
							config += '\\n  - name: Auto\\n    type: url-test\\n    proxies:\\n';
							nodes.forEach(n => {
								config += \`      - \${n.name}\\n\`;
							});
							if (providers.length > 0) {
								config += '    use:\\n';
								providers.forEach(p => {
									config += \`      - \${p.providerName}\\n\`;
								});
							}
							config += '    url: http://www.gstatic.com/generate_204\\n    interval: 300\\n';
						}
						
						config += '\\n# 规则\\nrules:\\n';
						config += '  - GEOSITE,category-ads-all,REJECT\\n';
						config += '  - GEOSITE,cn,DIRECT\\n';
						config += '  - GEOIP,CN,DIRECT\\n';
						config += '  - MATCH,Proxy\\n';
						
						document.getElementById('clashConfig').value = config;
						alert('已生成默认 Clash 配置');
					}
					
					function extractExistingProviders(config) {
						var names = [];
						var lines = config.split('\\n');
						var inProviders = false;
						for (var i = 0; i < lines.length; i++) {
							var t = lines[i].trim();
							if (t === 'proxy-providers:') { inProviders = true; continue; }
							if (inProviders) {
								if (t.indexOf('- name:') === 0 || (t.indexOf('- name:') === -1 && t.indexOf(' ') !== 0 && t !== '' && t.indexOf('#') !== 0 && t.indexOf('proxy-groups:') === -1)) {
									if (t.indexOf('proxy-groups:') === 0 || t.indexOf('rules:') === 0 || t.indexOf('proxies:') === 0 || t.indexOf('rule-providers:') === 0) { inProviders = false; continue; }
								}
								if (t.indexOf('proxy-groups:') === 0 || t.indexOf('rules:') === 0 || t.indexOf('rule-providers:') === 0) { inProviders = false; continue; }
								if (t.length > 1 && t.charAt(t.length - 1) === ':' && t.indexOf(' ') === -1 && t.indexOf('#') !== 0) {
									names.push(t.slice(0, -1));
								}
							}
						}
						return names;
					}
					
					function extractExistingProviderUrls(config) {
						var urls = [];
						var lines = config.split('\\n');
						var inProviders = false;
						for (var i = 0; i < lines.length; i++) {
							var t = lines[i].trim();
							if (t === 'proxy-providers:') { inProviders = true; continue; }
							if (inProviders && (t.indexOf('proxy-groups:') === 0 || t.indexOf('rules:') === 0 || t.indexOf('rule-providers:') === 0)) { inProviders = false; break; }
							if (inProviders) {
								var urlMatch = t.match(/^url:\s*["']([^"']+)["']/);
								if (urlMatch) urls.push(urlMatch[1]);
							}
						}
						return urls;
					}
					
					function extractExistingProxies(config) {
						var names = [];
						var lines = config.split('\\n');
						var inProxies = false;
						for (var i = 0; i < lines.length; i++) {
							var t = lines[i].trim();
							if (t === 'proxies:') { inProxies = true; continue; }
							if (inProxies && (t.indexOf('proxy-groups:') === 0 || t.indexOf('proxy-providers:') === 0 || t.indexOf('rules:') === 0 || t.indexOf('rule-providers:') === 0)) { inProxies = false; break; }
							if (inProxies) {
								var nameMatch = t.match(/^- name:\s*["']?([^"']+)["']?/);
								if (nameMatch) names.push(nameMatch[1]);
							}
						}
						return names;
					}
					
					function extractExistingProxiesKeys(config) {
						var hashes = [];
						var lines = config.split('\\n');
						var inProxies = false;
						var block = {};
						
						for (var i = 0; i < lines.length; i++) {
							var t = lines[i].trim();
							if (t === 'proxies:') { inProxies = true; continue; }
							if (inProxies && (t.indexOf('proxy-groups:') === 0 || t.indexOf('proxy-providers:') === 0 || t.indexOf('rules:') === 0 || t.indexOf('rule-providers:') === 0)) { inProxies = false; break; }
							if (inProxies) {
								if (t.indexOf('- name:') === 0) {
									if (block.server) {
										var key = (block.type || '') + '|' + block.server + '|' + (block.port || '') + '|' + (block.uuid || block.password || '');
										hashes.push(hashString(key));
									}
									block = {};
								} else if (t.indexOf('server:') === 0) block.server = t.replace('server:', '').trim();
								else if (t.indexOf('port:') === 0) block.port = t.replace('port:', '').trim();
								else if (t.indexOf('type:') === 0) block.type = t.replace('type:', '').trim();
								else if (t.indexOf('uuid:') === 0) block.uuid = t.replace('uuid:', '').trim();
								else if (t.indexOf('password:') === 0) block.password = t.replace('password:', '').trim();
							}
						}
						if (block.server) {
							var key = (block.type || '') + '|' + block.server + '|' + (block.port || '') + '|' + (block.uuid || block.password || '');
							hashes.push(hashString(key));
						}
						return hashes;
					}
					
					function findSectionEnd(config, sectionName) {
						var lines = config.split('\\n');
						var inSection = false;
						var startIdx = 0;
						for (var i = 0; i < lines.length; i++) {
							if (lines[i].trim() === sectionName + ':') {
								inSection = true;
								startIdx = i + 1;
								continue;
							}
							if (inSection) {
								if (lines[i].trim() !== '' && !lines[i].startsWith('#')) {
									var leadingSpaces = lines[i].length - lines[i].trimStart().length;
									if (leadingSpaces < 4) {
										var pos = 0;
										for (var j = 0; j < i; j++) pos += lines[j].length + 1;
										return pos;
									}
								}
							}
						}
						return config.length;
					}
					
					function updateProxyGroups(config, nodeNames, providerNames) {
						var lines = config.split('\\n');
						var output = [];
						var inProxyGroups = false;
						var groupStart = -1;
						var groupEnd = -1;
						var groupHasUse = false;
						var groupHasProxies = false;
						var groupUseEnd = -1;
						var groupProxiesEnd = -1;
						var currentGroupName = '';
						
						function flushGroup() {
							if (groupStart < 0) return;
							
							for (var g = groupStart; g <= groupEnd; g++) {
								output.push(lines[g]);
							}
							
							var isAdGroup = currentGroupName.includes('广告') || currentGroupName.toLowerCase().includes('advertise');

							// 每个 group 都插入默认 proxies + 节点名（排除自身名称，避免自引用）
							var allProxies = [];
							if (isAdGroup) {
								allProxies = ['REJECT', 'DIRECT'];
							} else {
								var defaultProxies = [];
								if (currentGroupName !== '自动选择' && currentGroupName !== '手动切换') {
									defaultProxies = ['DIRECT', '手动切换', '自动选择'].filter(function(p) { return p !== currentGroupName; });
								}
								var filteredNodeNames = nodeNames.filter(function(n) { return n !== currentGroupName; });
								allProxies = defaultProxies.concat(filteredNodeNames);
							}

							if (groupHasProxies) {
								for (var k = 0; k < allProxies.length; k++) {
									output.splice(groupProxiesEnd + 1, 0, '      - ' + allProxies[k]);
									groupProxiesEnd++;
								}
							} else {
								output.push('    proxies:');
								for (var k = 0; k < allProxies.length; k++) {
									output.push('      - ' + allProxies[k]);
								}
							}
							
							// 插入 use: 块
							if (providerNames.length > 0 && !isAdGroup) {
								if (groupHasUse) {
									for (var k = 0; k < providerNames.length; k++) {
										output.splice(groupUseEnd + 1, 0, '      - ' + providerNames[k]);
										groupUseEnd++;
									}
								} else {
									output.push('    use:');
									for (var k = 0; k < providerNames.length; k++) {
										output.push('      - ' + providerNames[k]);
									}
								}
							}
							
							groupStart = -1;
							groupEnd = -1;
							groupHasUse = false;
							groupHasProxies = false;
							groupUseEnd = -1;
							groupProxiesEnd = -1;
							currentGroupName = '';
						}
						
						for (var i = 0; i < lines.length; i++) {
							var trimmed = lines[i].trim();
							
							if (trimmed === 'proxy-groups:') {
								output.push(lines[i]);
								inProxyGroups = true;
								continue;
							}
							
							if (inProxyGroups && (trimmed === 'rules:' || trimmed === 'proxy-providers:' || trimmed === 'rule-providers:')) {
								flushGroup();
								inProxyGroups = false;
								output.push(lines[i]);
								continue;
							}
							
							if (inProxyGroups && trimmed.indexOf('- name:') === 0) {
								flushGroup();
								groupStart = i;
								groupEnd = i;
								groupHasUse = false;
								groupHasProxies = false;
								groupUseEnd = -1;
								groupProxiesEnd = -1;
								// 提取当前组名称，用于排除自引用
								currentGroupName = trimmed.replace('- name:', '').trim();
								// 去除可能的引号包裹
								if ((currentGroupName.startsWith('"') && currentGroupName.endsWith('"')) || (currentGroupName.startsWith("'") && currentGroupName.endsWith("'"))) {
									currentGroupName = currentGroupName.slice(1, -1);
								}
								continue;
							}
							
							if (inProxyGroups && groupStart >= 0) {
								groupEnd = i;
								if (trimmed === 'use:') {
									groupHasUse = true;
									groupUseEnd = i;
								}
								if (trimmed === 'proxies:') {
									groupHasProxies = true;
									groupProxiesEnd = i;
								}
								if (groupHasUse && lines[i].indexOf('      - ') === 0) {
									groupUseEnd = i;
								}
								if (groupHasProxies && lines[i].indexOf('      - ') === 0) {
									groupProxiesEnd = i;
								}
								continue;
							}
							
							output.push(lines[i]);
						}
						
						flushGroup();
						return output.join('\\n');
					}
					
					function extractNodeName(node) {
						// 尝试从节点链接中提取名称
						const nameMatch = node.match(/#(.+)$/);
						if (nameMatch) {
							return decodeURIComponent(nameMatch[1]);
						}
						
						// 从 URL 中提取信息生成名称
						try {
							if (node.startsWith('vless://') || node.startsWith('vmess://') || node.startsWith('trojan://')) {
								const url = new URL(node);
								const host = url.hostname;
								const port = url.port;
								return \`\${node.split('://')[0].toUpperCase()}-\${host}:\${port}\`;
							}
						} catch (e) {}
						
						return \`Node-\${Math.random().toString(36).substr(2, 6)}\`;
					}
					
					function getNodeType(node) {
						if (node.startsWith('vless://')) return 'vless';
						if (node.startsWith('vmess://')) return 'vmess';
						if (node.startsWith('trojan://')) return 'trojan';
						if (node.startsWith('ss://')) return 'ss';
						if (node.startsWith('ssr://')) return 'ssr';
						if (node.startsWith('hysteria2://') || node.startsWith('hy2://')) return 'hysteria2';
						if (node.startsWith('hysteria://')) return 'hysteria';
						if (node.startsWith('tuic://')) return 'tuic';
						return 'unknown';
					}
					
					function extractProviderName(url) {
						try {
							const hostname = new URL(url).hostname;
							const parts = hostname.split('.');
							return parts[parts.length - 2] || hostname;
						} catch (e) {
							return 'provider-' + Math.random().toString(36).substr(2, 6);
						}
					}
					
					function parseNodeToClash(node, name) {
						const type = getNodeType(node);
						let result = \`  - name: "\${name}"\\n\`;
						result += \`    type: \${type}\\n\`;
						
						try {
							if (type === 'vless' || type === 'trojan') {
								const url = new URL(node);
								result += \`    server: \${url.hostname}\\n\`;
								result += \`    port: \${url.port || 443}\\n\`;
								
								const params = {};
								url.searchParams.forEach((v, k) => { params[k] = v; });
								
								if (type === 'vless') {
									result += \`    uuid: \${url.username}\\n\`;
									result += \`    cipher: \${params.cipher || 'auto'}\\n\`;
								} else {
									result += \`    password: \${url.username}\\n\`;
								}
								
								result += \`    tls: \${params.security === 'tls'}\\n\`;
								if (params.sni) result += \`    servername: \${params.sni}\\n\`;
								if (params.fp) result += \`    client-fingerprint: \${params.fp}\\n\`;
								if (params.flow) result += \`    flow: \${params.flow}\\n\`;
								
								if (params.type === 'ws') {
									result += '    network: ws\\n';
									if (params.path) result += \`    ws-opts:\\n      path: "\${params.path}"\\n\`;
									if (params.host) result += \`      headers:\\n        Host: "\${params.host}"\\n\`;
								} else if (params.type === 'grpc') {
									result += '    network: grpc\\n';
									if (params.serviceName) result += \`    grpc-opts:\\n      grpc-service-name: "\${params.serviceName}"\\n\`;
								}
							} else if (type === 'vmess') {
								const decoded = atob(node.replace('vmess://', ''));
								const data = JSON.parse(decoded);
								result += \`    server: \${data.add}\\n\`;
								result += \`    port: \${data.port}\\n\`;
								result += \`    uuid: \${data.id}\\n\`;
								result += \`    alterId: \${data.aid || 0}\\n\`;
								result += \`    cipher: auto\\n\`;
								result += \`    tls: \${data.tls === 'tls'}\\n\`;
								if (data.sni) result += \`    servername: \${data.sni}\\n\`;
								
								if (data.net === 'ws') {
									result += '    network: ws\\n';
									if (data.path) result += \`    ws-opts:\\n      path: "\${data.path}"\\n\`;
									if (data.host) result += \`      headers:\\n        Host: "\${data.host}"\\n\`;
								} else if (data.net === 'grpc') {
									result += '    network: grpc\\n';
									if (data.path) result += \`    grpc-opts:\\n      grpc-service-name: "\${data.path}"\\n\`;
								}
							} else if (type === 'ss') {
								const decoded = atob(node.replace('ss://', '').split('@')[0] + '==');
								const parts = decoded.split(':');
								const url = new URL(node.replace('ss://', '@'));
								result += \`    server: \${url.hostname}\\n\`;
								result += \`    port: \${url.port}\\n\`;
								result += \`    cipher: \${parts[0]}\\n\`;
								result += \`    password: \${parts[1]}\\n\`;
							} else if (type === 'hysteria2') {
								const url = new URL(node.replace('hy2://', 'hysteria2://'));
								result += \`    server: \${url.hostname}\\n\`;
								result += \`    port: \${url.port}\\n\`;
								result += \`    password: \${url.username}\\n\`;
								const params = {};
								url.searchParams.forEach((v, k) => { params[k] = v; });
								if (params.sni) result += \`    sni: \${params.sni}\\n\`;
								result += \`    tls:\\n      enabled: true\\n\`;
								if (params.insecure === '1') result += \`      verify: false\\n\`;
							}
						} catch (e) {
							result += \`    # 解析失败: \${e.message}\\n\`;
						}
						
						return result;
					}
					
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
					
					function saveTGConfig() {
						const tgToken = document.getElementById('tgToken');
						const tgChatId = document.getElementById('tgChatId');
						const tgMode = document.getElementById('tgMode');
						const status = document.getElementById('tgSaveStatus');
						const saveBtn = event.target;
						
						if (!tgToken || !tgChatId || !tgMode) return;
						
						const config = {
							TGTOKEN: tgToken.value.trim(),
							TGID: tgChatId.value.trim(),
							TG: parseInt(tgMode.value)
						};
						
						saveBtn.disabled = true;
						saveBtn.textContent = '保存中...';
						status.textContent = '';
						
						fetch(window.location.href, {
							method: 'POST',
							body: JSON.stringify(config),
							headers: {
								'Content-Type': 'application/json'
							},
							cache: 'no-cache'
						})
						.then(response => {
							if (!response.ok) throw new Error('HTTP ' + response.status);
							return response.json();
						})
						.then(data => {
							const now = new Date().toLocaleString('zh-CN');
							status.textContent = '✓ 设置已保存 ' + now;
							status.className = 'save-status success';
						})
						.catch(error => {
							status.textContent = '✗ 保存失败: ' + error.message;
							status.className = 'save-status error';
						})
						.finally(() => {
							saveBtn.disabled = false;
							saveBtn.textContent = '保存设置';
						});
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
						initTheme();
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