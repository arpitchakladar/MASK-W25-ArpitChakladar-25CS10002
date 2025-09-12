{
	description = "Web development environment for MASK Tasks.";

	inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
		flake-utils.url = "github:numtide/flake-utils";
	};

	outputs = { self, nixpkgs, flake-utils }:
		flake-utils.lib.eachDefaultSystem (system:
			let
				pkgs = import nixpkgs {
					inherit system;
					config.allowUnfree = true;
				};
			in
			{
				devShells.default = pkgs.mkShell {
					buildInputs = with pkgs; [
						nodejs_20
						nodePackages.pnpm
						chromium
						mongodb
						mongosh
					];

					shellHook = ''
			 			export MONGOMS_SYSTEM_BINARY=$(command -v mongod || echo "${pkgs.mongodb}/bin/mongod")
						${pkgs.mongodb}/bin/mongod --dbpath ./B21-2FA/db --bind_ip 127.0.0.1 --port 27017 --quiet --logpath ./mongo.log --logappend &
						export MONGODB_URI=mongodb://127.0.0.1:27017
						echo "Started MongoDB Server at mongodb://127.0.0.1:27017"
						echo "🚀 Web development environment ready!"
						echo "Node.js: $(node --version)"
						echo "NPM:		$(npm --version)"
					'';
				};
			});
}
