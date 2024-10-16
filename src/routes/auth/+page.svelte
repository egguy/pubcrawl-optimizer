


<div class="flex items-center justify-center min-h-screen bg-gray-100">
	<div class="bg-white p-8 rounded shadow-md w-full max-w-md">
		<h1 class="text-2xl font-bold mb-4">Login</h1>
		<form method="POST" action="?/login">
			<label for="email" class="block text-sm font-medium text-gray-700">
				Email
			</label>
			<input name="email" type="email" id="email" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />

			<label class="block text-sm font-medium text-gray-700" for="password">
				Password
			</label>
			<input id="password" name="password" type="password" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />

			<div class="w-fullflex items-center justify-between mt-4">
				<div class="flex items">
					<button class="w-full bg-slate-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-2">Login</button>
					<button class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-2" formaction="?/signup">Sign up</button>
				</div>
			</div>

		</form>
	</div>
</div>