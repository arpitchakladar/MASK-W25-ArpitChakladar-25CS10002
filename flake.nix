{
	description = "Web development environment for MASK Tasks.";

	inputs = {
		nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
		flake-utils.url = "github:numtide/flake-utils";
	};

	outputs = { self, nixpkgs, flake-utils }:
		flake-utils.lib.eachDefaultSystem (system:
			let
				pkgs = import nixpkgs { inherit system; };
			in
			{
				devShells.default = pkgs.mkShell {
					buildInputs = with pkgs; [
						nodejs_20
						nodePackages.pnpm
						chromium
					];

					shellHook = ''
						echo "🚀 Web development environment ready!"
						echo "Node.js: $(node --version)"
						echo "PNPM:    $(pnpm --version)"
					'';
				};
			});
}
